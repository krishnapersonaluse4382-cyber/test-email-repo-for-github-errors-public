import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";

const DASHBOARD_SUPABASE_URL = "https://psqebjafyjrtxarphkej.supabase.co";

serve(async (_req) => {
    try {
        // Read all secrets
        const emailUser = Deno.env.get("EMAIL_USER")?.trim();
        const emailPass = Deno.env.get("EMAIL_PASS")?.trim();
        const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
        const dashKey = Deno.env.get("DASHBOARD_SUPABASE_KEY")?.trim();

        if (!emailUser || !emailPass || !supabaseUrl || !serviceKey) {
            return new Response(JSON.stringify({
                error: "One or more secrets are missing",
                EMAIL_USER: emailUser ? `SET (${emailUser})` : "MISSING",
                EMAIL_PASS: emailPass ? "SET" : "MISSING",
                SUPABASE_URL: supabaseUrl ? "SET" : "MISSING",
                SUPABASE_SERVICE_ROLE_KEY: serviceKey ? "SET" : "MISSING",
                DASHBOARD_SUPABASE_KEY: dashKey ? "SET" : "MISSING (dashboard sync disabled)",
            }), { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);

        // Find next READY lead
        const now = new Date().toISOString();
        const { data: leads, error } = await supabase
            .from("email_logs")
            .select("*")
            .eq("status", "READY")
            .lte("scheduled_at", now)
            .order("scheduled_at", { ascending: true })
            .limit(1);

        if (error) throw new Error("DB error: " + error.message);
        if (!leads || leads.length === 0) {
            return new Response(JSON.stringify({ message: "No leads ready to send right now" }), { status: 200 });
        }

        const lead = leads[0];

        // Cloud Lock — prevent duplicate sends
        await supabase
            .from("email_logs")
            .update({ status: "SENDING_NOW" })
            .eq("id", lead.id)
            .eq("status", "READY");

        // Detect which agent is sending based on campaign name
        const cid = (lead.campaign_id || "").toUpperCase();
        const sentVia = cid.includes("RIK") ? "Rik"
            : cid.includes("RYAN") ? "Ryan"
                : "Krishna";

        // Send via Gmail
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: emailUser, pass: emailPass },
        });

        // Tracking URL base (Point to the LIVE dashboard)
        const TRACKING_URL = "https://email-dashboard-app.vercel.app";

        await transporter.sendMail({
            from: `"Cold Email Automation" <${emailUser}>`,
            to: lead.email,
            subject: lead.subject || "Campaign Email",
            text: lead.body || "This email was sent from Supabase Cloud.", // Fallback
            html: `
                <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                    ${(lead.body || "This email was sent from Supabase Cloud.").replace(/\n/g, '<br>')}
                </div>
                <img src="${TRACKING_URL}/api/track?id=${lead.id}" width="1" height="1" style="display:none !important;" />
            `,
        });

        const sentAt = new Date().toISOString();

        // Mark as SENT in our Supabase
        await supabase
            .from("email_logs")
            .update({ status: "SENT", sent_at: sentAt })
            .eq("id", lead.id);

        let syncStatus = "SKIPPED (no key)";
        if (dashKey) {
            try {
                const dashResp = await fetch(`${DASHBOARD_SUPABASE_URL}/rest/v1/email_sent`, {
                    method: "POST",
                    headers: {
                        "apikey": dashKey,
                        "Authorization": `Bearer ${dashKey}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({
                        email_id: lead.id.toString(),
                        recipient: lead.email,
                        sender: emailUser,
                        sent_at: sentAt,
                        category: lead.campaign_id || "Direct",
                        subject: lead.subject || "Headless Send",
                        lead_source: "Headless"
                    })
                });

                if (!dashResp.ok) {
                    const errText = await dashResp.text();
                    syncStatus = `FAILED: ${dashResp.status} - ${errText}`;
                    console.error("Dashboard sync failed:", syncStatus);
                } else {
                    syncStatus = "OK";
                }
            } catch (dashErr) {
                syncStatus = `ERROR: ${dashErr.message}`;
                console.error("Dashboard sync error:", syncStatus);
            }
        }

        return new Response(
            JSON.stringify({
                message: "Email process complete",
                to: lead.email,
                from: emailUser,
                campaign: lead.campaign_id,
                dashboard_sync: syncStatus
            }),
            { status: 200 }
        );

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});
