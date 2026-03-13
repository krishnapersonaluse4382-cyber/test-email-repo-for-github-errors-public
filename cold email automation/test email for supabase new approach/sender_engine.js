require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("❌ CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing from environment variables.");
    console.error("If running in GitHub Actions, ensure you have added these to Repository Secrets.");
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log(`🔗 Connecting to Supabase: ${process.env.SUPABASE_URL.substring(0, 15)}...`);
console.log(`👤 Using Sender: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.split('@')[0] : 'MISSING'} (Password present: ${!!process.env.EMAIL_PASS})`);

const senders = {
    KRISHNA: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS, label: "Krishna (Content Elevators)" },
    RYAN: { user: process.env.RYAN_USER, pass: process.env.RYAN_PASS, label: "Ryan (Content Elevators)" },
    RIK: { user: process.env.RIK_USER, pass: process.env.RIK_PASS, label: "Rik (Content Elevators)" }
};

function getTransporter(senderKey) {
    const config = senders[senderKey];
    if (!config || !config.user || !config.pass) {
        throw new Error(`Config for ${senderKey} is missing!`);
    }
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: config.user, pass: config.pass }
    });
}

async function processQueue() {
    console.log(`🚀 [${new Date().toISOString()}] Starting Production Queue Processor...`);

    // 1. Fetch leads that are 'READY' for any campaign
    // We limit to 5 per run to avoid Gmail spam blocks in standard automation
    const { data: leads, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('status', 'READY')
        .limit(5);

    if (error) {
        console.error("❌ Database Error fetching queue:", error.message);
        return;
    }

    if (!leads || leads.length === 0) {
        console.log("💤 No 'READY' leads in queue. Sleeping.");
        return;
    }

    console.log(`📬 Found ${leads.length} leads in queue. Processing...`);

    for (const lead of leads) {
        // Use sender assigned in DB, or default to KRISHNA
        const senderKey = lead.sender_account || 'KRISHNA';
        await sendLeadEmail(lead, senderKey);
    }

    console.log("✅ Queue processing finished.");
}

async function sendLeadEmail(lead, senderKey) {
    const sender = senders[senderKey];
    const trackingId = lead.id; // Usually a UUID pre-generated on ingest
    const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${trackingId}`;

    // Mark as SENDING to prevent overlaps
    await supabase.from('email_logs')
        .update({ status: 'SENDING_NOW', started_at: new Date().toISOString() })
        .eq('id', lead.id);

    try {
        const transporter = getTransporter(senderKey);
        
        // Use subject/body from lead record (ingested during setup)
        const subject = lead.subject || "No Subject";
        const bodyContent = lead.body || "No Content";

        const info = await transporter.sendMail({
            from: `"${sender.label}" <${sender.user}>`,
            to: lead.email,
            subject: subject,
            html: `
                <div style="font-family: sans-serif; font-size: 16px; color: #333;">
                    ${bodyContent.replace(/\n/g, '<br>')}
                    <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                </div>
            `
        });

        console.log(`✅ [${senderKey}] Sent to ${lead.email} | MsgID: ${info.messageId}`);

        // Mark as SENT
        await supabase.from('email_logs')
            .update({ 
                status: 'SENT', 
                sent_at: new Date().toISOString(),
                message_id: info.messageId 
            })
            .eq('id', lead.id);

    } catch (err) {
        console.error(`❌ [${senderKey}] Failed for ${lead.email}:`, err.message);
        await supabase.from('email_logs')
            .update({ status: 'FAILED' })
            .eq('id', lead.id);
    }
}

processQueue();
