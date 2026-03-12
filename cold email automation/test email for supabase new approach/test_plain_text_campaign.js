require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const senders = {
    KRISHNA: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
};

const leads = [
    'prajapatijyoti66607@gmail.com',
    'animetvluffy@gmail.com',
    'Krishnapersonaluse438@gmail.com',
    'Krishnapersonaluse4382@gmail.com',
    'Krishnapersonaluse4383@gmail.com',
    'rik@contentelevators.org',
    'ryan@contentelevators.org',
    'prajapatirvk6@gmail.com'
];

async function runPlainTextCampaign() {
    const campaignId = "PLAIN_TEXT_AUDIT_001";
    const senderKey = "KRISHNA";
    const senderEmail = senders[senderKey].user;
    
    console.log(`\n🚀 Launching Plain-Text Style Campaign: ${campaignId}`);
    console.log(`📊 Target: ${leads.length} emails\n`);

    for (const email of leads) {
        const emailId = crypto.randomUUID();
        const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${emailId}`;

        console.log(`[SENDING] -> ${email}...`);

        // 1. Log to Supabase
        const { error: upsertError } = await supabase.from('email_logs').upsert({
            id: emailId,
            email: email,
            campaign_id: campaignId,
            status: 'SENDING_NOW',
            started_at: new Date().toISOString()
        }, { onConflict: 'email,campaign_id' });

        if (upsertError) {
            console.error(`❌ Supabase Error for ${email}:`, upsertError);
            continue;
        }

        // 2. Send Minimalist HTML (Looks like plain text)
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: senderEmail, pass: senders[senderKey].pass }
            });

            await transporter.sendMail({
                from: `"Krishna" <${senderEmail}>`,
                to: email,
                subject: `Quick Update: ${campaignId}`,
                // We use standard font and no styling, so it looks like a normal personal email
                html: `
                    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000;">
                        Hi,
                        <br><br>
                        This is the plain-text style test for the ${campaignId} campaign. 
                        No fancy blocks or colors here. 
                        <br><br>
                        Let's see if the tracking registers correctly on your end.
                        <br><br>
                        Best,<br>
                        Krishna
                        <img src="${trackingUrl}" width="1" height="1" style="display:none !important;" />
                    </div>
                `
            });

            // 3. Mark as SENT
            await supabase.from('email_logs')
                .update({ status: 'SENT', sent_at: new Date().toISOString() })
                .eq('id', emailId);

            console.log(`✅ Sent to ${email}`);
        } catch (sendError) {
            console.error(`❌ Mail Error for ${email}:`, sendError.message);
        }

        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n✨ Finished! All 8 "Plain Text" style emails are sent.`);
}

runPlainTextCampaign().catch(console.error);
