require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const senders = {
    KRISHNA: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
};

async function sendVerification() {
    const recipient = 'prajapatijyoti66607@gmail.com';
    const campaignId = 'LIVE_FIX_VERIFICATION';
    const senderKey = 'KRISHNA';
    const senderEmail = senders[senderKey].user;
    
    console.log(`\n🚀 Launching Verification Email to: ${recipient}`);

    const emailId = crypto.randomUUID();
    const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${emailId}`;

    // 1. Log to Supabase (Upsert to ensure record exists)
    const { error: upsertError } = await supabase.from('email_logs').upsert({
        id: emailId,
        email: recipient,
        campaign_id: campaignId,
        status: 'SENDING_NOW',
        started_at: new Date().toISOString()
    });

    if (upsertError) {
        console.error('❌ Supabase Upsert Error:', upsertError);
        return;
    }

    // 2. Send via Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: senderEmail, pass: senders[senderKey].pass }
    });

    await transporter.sendMail({
        from: `"Antigravity Fix" <${senderEmail}>`,
        to: recipient,
        subject: `Verification Success: ${campaignId}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #7C3AED; borderRadius: 12px; background: #030407; color: #fff;">
                <h2 style="color: #7C3AED;">Tracking Logic Verified</h2>
                <p>Hello! This email contains the upgraded tracking UUID and HTML pixel.</p>
                <p><b>Steps to test:</b></p>
                <ol>
                    <li>Wait 45 seconds from now.</li>
                    <li>Open this email.</li>
                    <li>Check the "LIVE_FIX_VERIFICATION" folder in your dashboard.</li>
                </ol>
                <p style="font-size: 0.8rem; color: #64748B;">ID: ${emailId}</p>
                <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
            </div>
        `
    });

    // 3. Mark as SENT
    await supabase.from('email_logs')
        .update({ status: 'SENT', sent_at: new Date().toISOString() })
        .eq('id', emailId);

    console.log(`✅ Success! Verification email sent.`);
    console.log(`🆔 ID: ${emailId}`);
    console.log(`📂 Campaign: ${campaignId}`);
}

sendVerification().catch(console.error);
