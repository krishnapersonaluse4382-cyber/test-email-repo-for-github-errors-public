require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. SENDER PROFILES (Centralized Management)
const senders = {
    KRISHNA: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    RYAN: { user: process.env.RYAN_USER, pass: process.env.RYAN_PASS },
    RIK: { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
};

function getTransporter(senderKey) {
    const config = senders[senderKey];
    if (!config || !config.user || !config.pass) {
        throw new Error(`Config for ${senderKey} is missing in .env!`);
    }
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: config.user, pass: config.pass }
    });
}

// 2. CORE SAFETY LOGIC (MULTI-SENDER SUPPORT)
async function sendSafeEmail(senderKey, leadEmail, campaignId, subject, body) {
    const senderEmail = senders[senderKey].user;
    try {
        console.log(`--- [SENDER: ${senderKey}] SENDING TO ${leadEmail} ---`);

        // Check the Cloud Lock
        const { data: existingLog } = await supabase
            .from('email_logs')
            .select('*')
            .eq('email', leadEmail)
            .eq('campaign_id', campaignId)
            .maybeSingle();

        if (existingLog && existingLog.status === 'SENT') {
            console.log(`[SAFETY]: Already SENT by ${existingLog.sender_email || 'unknown'}. Skipping.`);
            return;
        }

        // Generate Unique ID for Tracking
        const emailId = crypto.randomUUID();
        const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${emailId}`;

        // Apply Lock with ID
        await supabase.from('email_logs').upsert({
            id: emailId,
            email: leadEmail,
            campaign_id: campaignId,
            status: 'SENDING_NOW',
            started_at: new Date().toISOString()
        }, { onConflict: 'email,campaign_id' });

        // Send
        const transporter = getTransporter(senderKey);
        const info = await transporter.sendMail({
            from: senderEmail,
            to: leadEmail,
            subject: subject,
            html: `
                <div style="font-family: sans-serif;">
                    ${body.replace(/\n/g, '<br>')}
                    <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                </div>
            `
        });
        console.log(`[SUCCESS]: Msg ID: ${info.messageId}`);

        // Update to SENT
        await supabase.from('email_logs')
            .update({ status: 'SENT', sent_at: new Date().toISOString() })
            .eq('email', leadEmail)
            .eq('campaign_id', campaignId);

        console.log(`[COMPLETE]: Log updated in Supabase.`);

    } catch (error) {
        console.error(`[CRASH]:`, error.message);
    }
}

// 3. SCHEDULED INTERVAL TEST (RIK ONLY - 2 MIN DELAY)
async function runScheduledIntervalTest() {
    const campaignId = "SCHEDULED_INTERVAL_TEST_001";
    const senderKey = "RIK"; // Specific request to use Rik

    console.log(`--- [SCHEDULED] STARTING INTERVAL TEST FROM ${senderKey} ---`);
    console.log(`Interval: 120,000ms (2 minutes)`);

    const { data: leads, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'READY');

    if (error || !leads || leads.length === 0) {
        console.log("No READY leads found for scheduled interval test.");
        return;
    }

    for (const lead of leads) {
        await sendSafeEmail(
            senderKey,
            lead.email,
            campaignId,
            "Scheduled Interval Test (2m)",
            `Hello! This is a scheduled test from the Rik workspace account. \nInterval: 2 minutes. \nTarget: ${lead.email}`
        );

        console.log(`Waiting 2 minutes before next send...`);
        // 2 minutes = 120,000 milliseconds
        await new Promise(r => setTimeout(r, 120000));
    }
    console.log("--- SCHEDULED TEST FINISHED ---");
}

runScheduledIntervalTest();
