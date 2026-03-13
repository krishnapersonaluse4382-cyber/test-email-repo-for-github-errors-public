const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runTest() {
    const email_uuid   = crypto.randomUUID();
    const recipient    = 'prajapatijyoti66607@gmail.com';
    const campaign_id  = 'DASHBOARD_OPEN_TEST_V2';
    const sender_email = process.env.EMAIL_USER;

    const trackingUrl  = `https://email-dashboard-app.vercel.app/api/track?id=${email_uuid}`;

    console.log(`\n🚀 Sending verification email to: ${recipient}`);
    console.log(`🆔 UUID: ${email_uuid}`);

    // STEP 1: Insert into email_logs
    const { error: logError } = await supabase.from('email_logs').insert([{
        id:          email_uuid,
        email:       recipient,
        status:      'SENT',
        campaign_id: campaign_id,
        sent_at:     new Date().toISOString()
    }]);

    if (logError) {
        console.error('❌ Supabase insert failed:', logError.message);
        return;
    }

    // STEP 2: Send Email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: sender_email, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
        from: `"Krishna" <${sender_email}>`,
        to: recipient,
        subject: `Verification Test - Campaign: ${campaign_id}`,
        html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2>Verification Test</h2>
            <p>Please open this email to verify if the open rate tracking works.</p>
            <p>Once opened, check the <b>DASHBOARD_OPEN_TEST</b> campaign in your dashboard.</p>
            <img src="${trackingUrl}" width="1" height="1" style="display:none;" />
        </div>`
    });

    console.log('✅ Success! Email sent and logged.');
    console.log(`🔗 Tracking URL: ${trackingUrl}`);
}

runTest().catch(console.error);
