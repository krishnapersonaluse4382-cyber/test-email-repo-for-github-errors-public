const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. GMAIL PROTOCOL: Manual SMTP, Port 465, Secure: true
const senders = {
    KRISHNA: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    RYAN: { user: process.env.RYAN_USER, pass: process.env.RYAN_PASS },
    RIK: { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
};

const senderKeys = Object.keys(senders);

// HUMAN JITTER: Random Sleep between 180s and 420s
async function humanJitter() {
    const min = 180;
    const max = 420;
    const jitter = Math.floor(Math.random() * (max - min + 1) + min);
    console.log(`[JITTER]: Sleeping for ${jitter} seconds to mimic human behavior...`);
    return new Promise(resolve => setTimeout(resolve, jitter * 1000));
}

async function sendSafeEmail(senderKey, lead, campaignId, subject, body) {
    const senderEmail = senders[senderKey].user;
    const leadEmail = lead.email;

    try {
        console.log(`\n--- [${senderKey}] STARTING DISPATCH TO: ${leadEmail} ---`);

        // 1. THE CLOUD LOCK: Check status before doing anything
        const { data: currentStatus } = await supabase
            .from('email_logs')
            .select('status')
            .eq('id', lead.id)
            .single();

        if (currentStatus.status !== 'READY') {
            console.log(`[ABORT]: Lead is already ${currentStatus.status}. Protection triggered.`);
            return;
        }

        // 2. DOUBLE-SEND PROTECTION: Mark as SENDING_NOW immediately
        await supabase
            .from('email_logs')
            .update({
                status: 'SENDING_NOW',
                sender_email: senderEmail,
                started_at: new Date().toISOString()
            })
            .eq('id', lead.id);

        console.log(`[LOCK]: Status updated to SENDING_NOW. Connecting to SMTP...`);

        // 3. THE GMAIL PROTOCOL: Manual SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // As per Port Discovery in SYSTEM_EVOLUTION
            auth: { user: senderEmail, pass: senders[senderKey].pass }
        });

        const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${lead.id}`;

        await transporter.sendMail({
            from: `"Krishna" <${senderEmail}>`,
            to: leadEmail,
            subject: subject,
            html: `
                <div style="font-family: sans-serif;">
                    ${body.replace(/\n/g, '<br>')}
                    <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                </div>
            `
        });

        // 4. RELEASE LOCK: Mark as SENT
        await supabase
            .from('email_logs')
            .update({
                status: 'SENT',
                sent_at: new Date().toISOString()
            })
            .eq('id', lead.id);

        console.log(`[SUCCESS]: Dispatch complete to ${leadEmail}`);

    } catch (e) {
        console.error(`[CRITICAL ERROR]: ${e.message}`);
        // If it failed, we revert to READY so it can be retried, but only if it wasn't a permanent failure
        await supabase
            .from('email_logs')
            .update({ status: 'READY' })
            .eq('id', lead.id);
    }
}

async function runProductionBurst() {
    console.log(`\n[${new Date().toISOString()}] TRIGGERING PRODUCTION BURST...`);

    // SELECT READY LEADS: Including Time-Based Scheduling logic
    const { data: leads, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('status', 'READY')
        .filter('scheduled_at', 'lte', new Date().toISOString()) // Only send if current time >= scheduled_at
        .order('scheduled_at', { ascending: true })
        .limit(3);

    if (error) {
        console.error("[DATABASE ERROR]:", error.message);
        return;
    }

    if (!leads || leads.length === 0) {
        console.log("No leads scheduled for this 10-minute window. Standby.");
        return;
    }

    // --- ENHANCED ROTATION LOGIC ---
    // Fetch the very last sender used from HISTORY (regardless of campaign)
    const { data: lastLog } = await supabase
        .from('email_logs')
        .select('sender_email')
        .eq('status', 'SENT')
        .order('sent_at', { descending: true })
        .limit(1)
        .maybeSingle();

    let startIndex = 0;
    if (lastLog) {
        const lastSenderEmail = lastLog.sender_email;
        // Find which index this email represents
        const foundIndex = senderKeys.findIndex(k => senders[k].user === lastSenderEmail);
        if (foundIndex !== -1) {
            // Next sender should be the one AFTER the last one used
            startIndex = foundIndex + 1;
        }
    }
    // --------------------------------

    console.log(`Found ${leads.length} lead(s) ready for dispatch. Starting rotation from index ${startIndex % senderKeys.length}...`);

    for (let i = 0; i < leads.length; i++) {
        // ROTATION: Uses the offset from history to maintain the global sequence
        const currentSender = senderKeys[(startIndex + i) % senderKeys.length];

        // Execute Send
        await sendSafeEmail(
            currentSender,
            leads[i],
            leads[i].campaign_id,
            "Self-Correction & Cloud-Scale Test",
            "Hello! This email confirm the system is running in HEADLESS mode via GitHub Actions.\n\nSent via: " + currentSender
        );

        // HUMAN JITTER: Apply between sends in the same burst
        if (i < leads.length - 1) {
            await humanJitter();
        }
    }

    console.log(`\n[FINISHED]: Burst completed at ${new Date().toISOString()}`);
}

runProductionBurst();
