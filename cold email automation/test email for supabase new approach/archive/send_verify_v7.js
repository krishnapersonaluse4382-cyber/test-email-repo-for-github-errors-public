require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SENDER = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }; 
const RECIPIENT = 'krishnapersonaluse438@gmail.com';
const CAMPAIGN = 'STRESS_TEST_V7';

async function sendTest() {
    console.log(`🚀 Sending STRESS TEST V7 to ${RECIPIENT}...`);

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
        const info = await transporter.sendMail({
            from: `"The V7 Stress Test" <${SENDER.user}>`,
            to: RECIPIENT,
            subject: `V7 Stress Test: Verify Opens & Replies (${new Date().toLocaleTimeString()})`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #6366F1;">V7 Stress Test</h2>
                    <p>Testing sequence stability. User-driven verification.</p>
                    <p><b>Campaign:</b> ${CAMPAIGN}</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                </div>
            `
        });

        console.log(`Sent Message ID: ${info.messageId}`);

        // 4. Mark as SENT and save the MESSAGE-ID
        await supabase
            .from('email_logs')
            .update({ 
                status: 'SENT', 
                sent_at: new Date().toISOString(),
                message_id: info.messageId 
            })
            .eq('id', leadId);

        console.log(`✅ Test V7 sent! Record ID: ${leadId}`);
    } catch (err) {
        console.error('SMTP Error:', err.message);
        await supabase.from('email_logs').update({ status: 'FAILED' }).eq('id', leadId);
    }
}

sendTest();
