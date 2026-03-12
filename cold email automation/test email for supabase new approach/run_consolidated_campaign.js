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

async function runConsolidatedCampaign() {
    const campaignId = "EXCEL_CONSOLIDATED_SYNC";
    const senderKey = "KRISHNA";
    const senderEmail = senders[senderKey].user;
    
    console.log(`\n🚀 Launching Consolidated Campaign: ${campaignId}`);
    console.log(`📊 Target: ${leads.length} emails\n`);

    for (const email of leads) {
        const emailId = crypto.randomUUID();
        const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${emailId}`;

        console.log(`[SENDING] -> ${email}...`);

        // 1. Upsert to Supabase (Forces overwrite of old untracked data for this campaign)
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

        // 2. Send Email
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: senderEmail, pass: senders[senderKey].pass }
            });

            await transporter.sendMail({
                from: `"Email OS" <${senderEmail}>`,
                to: email,
                subject: `Campaign Audit: ${campaignId}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #7C3AED; border-radius: 12px; background: #030407; color: #fff;">
                        <h2 style="color: #7C3AED;">Consolidated Report Active</h2>
                        <p>This email is part of the <b>${campaignId}</b> campaign.</p>
                        <p>It is now equipped with the unique tracking signature <code>${emailId}</code>.</p>
                        <p><b>Reminder:</b> Please wait at least 45 seconds before opening this email to verify tracking accuracy.</p>
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

        // Brief delay to avoid spam filters during this burst
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n✨ Finished! All 8 emails are now processed and tracked.`);
}

runConsolidatedCampaign().catch(console.error);
