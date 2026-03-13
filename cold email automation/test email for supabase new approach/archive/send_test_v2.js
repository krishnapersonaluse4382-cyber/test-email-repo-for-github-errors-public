require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SENDER = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }; // Using main Krishna account
const RECIPIENT = 'krishnapersonaluse4382@gmail.com';
const CAMPAIGN = 'STRICT_ID_V2_VERIFY';

async function sendTest() {
    console.log(`🚀 Sending fresh test email to ${RECIPIENT}...`);

    // 1. Create the log entry first to get an ID
    const { data: log, error: logError } = await supabase
        .from('email_logs')
        .insert([{
            email: RECIPIENT,
            campaign_id: CAMPAIGN,
            status: 'SENDING_NOW',
            started_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (logError) {
        console.error('Failed to create log entry:', logError.message);
        return;
    }

    const leadId = log.id;
    console.log(`Generated Lead ID: ${leadId}`);

    // 2. Setup Transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: SENDER.user, pass: SENDER.pass }
    });

    const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${leadId}`;

    // 3. Send the Mail
    try {
        await transporter.sendMail({
            from: `"Krishna Dashboard Test" <${SENDER.user}>`,
            to: RECIPIENT,
            subject: `Test V2: Strictly Verified Tracking (${new Date().toLocaleTimeString()})`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #7C3AED;">Verification Test V2</h2>
                    <p>This email is sent to verify that the <b>Strict ID Tracking</b> fix is permanent.</p>
                    <p><b>Campaign ID:</b> ${CAMPAIGN}</p>
                    <p><b>Record ID:</b> ${leadId}</p>
                    <br/>
                    <p>Please open this email, then reply to it. We will check the dashboard together.</p>
                    <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                </div>
            `
        });

        // 4. Mark as SENT
        await supabase
            .from('email_logs')
            .update({ status: 'SENT', sent_at: new Date().toISOString() })
            .eq('id', leadId);

        console.log(`✅ Email sent successfully! Tracked with ID: ${leadId}`);
    } catch (err) {
        console.error('SMTP Error:', err.message);
        await supabase.from('email_logs').update({ status: 'FAILED' }).eq('id', leadId);
    }
}

sendTest();
