require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SENDER = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }; 
const RECIPIENT = 'krishnapersonaluse438@gmail.com';
const CAMPAIGN = 'HYBRID_VERIFY_V8';

async function sendTest() {
    console.log(`🚀 Sending HYBRID VERIFY V8 to ${RECIPIENT}...`);

    // 1. Create the log entry
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
        const info = await transporter.sendMail({
            from: `"Hybrid Tracking V8" <${SENDER.user}>`,
            to: RECIPIENT,
            subject: `V8 Test: Unique ID [${Math.floor(1000 + Math.random() * 9000)}]`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>V8 Hybrid Verification</h2>
                    <p>Testing latest-wins recency logic.</p>
                    <img src="${trackingUrl}" width="1" height="1" />
                </div>
            `
        });

        // 4. Mark as SENT and save the MESSAGE-ID
        await supabase
            .from('email_logs')
            .update({ 
                status: 'SENT', 
                sent_at: new Date().toISOString(),
                message_id: info.messageId 
            })
            .eq('id', leadId);

        console.log(`✅ Test V8 sent! Record ID: ${leadId}`);
    } catch (err) {
        console.error('SMTP Error:', err.message);
    }
}

sendTest();
