require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SENDER = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }; 
const RECIPIENT = 'krishnapersonaluse438@gmail.com';
const CAMPAIGN = 'SEQUENCE_TEST_V4';

async function sendTest() {
    console.log(`🚀 Sending SEQUENCE TEST V4 to ${RECIPIENT}...`);

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
        await transporter.sendMail({
            from: `"Stability V4" <${SENDER.user}>`,
            to: RECIPIENT,
            subject: `Test V4: Sequence Verification (${new Date().toLocaleTimeString()})`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #6366F1;">Tracking Sequence Test (V4)</h2>
                    <p>This test verifies the strict sequence: Send (0%) -> Open (100%) -> Reply (100%).</p>
                    <p><b>Campaign:</b> ${CAMPAIGN}</p>
                    <p><b>Recipient:</b> ${RECIPIENT}</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <ol>
                        <li><b>Phase 1:</b> The dashboard should currently show 0% Opens and 0% Replies.</li>
                        <li><b>Phase 2:</b> Open this email from your Gmail app. Dashboard will hit 100% Opens.</li>
                        <li><b>Phase 3:</b> Reply to this email. I will sync it, and Dashboard will hit 100% Replies.</li>
                    </ol>
                    <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                </div>
            `
        });

        // 4. Mark as SENT
        await supabase
            .from('email_logs')
            .update({ 
                status: 'SENT', 
                sent_at: new Date().toISOString() 
            })
            .eq('id', leadId);

        console.log(`✅ Test V4 sent! Record ID: ${leadId}`);
    } catch (err) {
        console.error('SMTP Error:', err.message);
        await supabase.from('email_logs').update({ status: 'FAILED' }).eq('id', leadId);
    }
}

sendTest();
