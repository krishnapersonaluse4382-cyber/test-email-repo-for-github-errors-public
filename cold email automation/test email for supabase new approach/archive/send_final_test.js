require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SENDER = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }; 
const RECIPIENT = 'krishnapersonaluse4382@gmail.com';
const CAMPAIGN = 'FINAL_STABILITY_CHECK';

async function sendTest() {
    console.log(`🚀 Sending FINAL STABILITY CHECK to ${RECIPIENT}...`);

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
            from: `"Stability Test" <${SENDER.user}>`,
            to: RECIPIENT,
            subject: `Final Check: System Stability (${new Date().toLocaleTimeString()})`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                    <h2 style="color: #6366F1;">System Stability Check</h2>
                    <p>This is the final test to confirm everything is working after the UI simplification.</p>
                    <p><b>Campaign:</b> ${CAMPAIGN}</p>
                    <p><b>ID:</b> ${leadId}</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <ol>
                        <li><b>Check Dashboard:</b> It should show 0% Opens/Replies for 'FINAL_STABILITY_CHECK'.</li>
                        <li><b>Open this mail.</b></li>
                        <li><b>Reply to this mail.</b></li>
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

        console.log(`✅ Final Test sent! Record ID: ${leadId}`);
    } catch (err) {
        console.error('SMTP Error:', err.message);
        await supabase.from('email_logs').update({ status: 'FAILED' }).eq('id', leadId);
    }
}

sendTest();
