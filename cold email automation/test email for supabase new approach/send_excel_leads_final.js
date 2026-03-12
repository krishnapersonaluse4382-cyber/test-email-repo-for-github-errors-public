const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SENDER_EMAIL = process.env.RIK_USER;
const SENDER_PASS = process.env.RIK_PASS;

async function runExcelBlast() {
    console.log('📬 Starting Excel-based Email Campaign (FALLBACK MODE)...');
    console.log(`🏠 SENDER: ${SENDER_EMAIL}`);
    
    const excelPath = 'C:/Users/praja/.gemini/antigravity/My projects/Workspace - 2/cold email automation/supabase + cronjobs/excel/full list for testing.xlsx';
    try {
        const workbook = XLSX.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const leads = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`📑 Found ${leads.length} leads in Excel.`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: SENDER_EMAIL, pass: SENDER_PASS }
        });

        for (const lead of leads) {
            const email = (lead.Emails || '').trim();
            const name = (lead.Name || 'Friend').trim();
            const industry = (lead.industry || 'General').trim();
            const platform = (lead.Platforom || 'Direct').trim(); // Misspelled column in excel

            if (!email) continue;

            // ONE campaign name as requested by USER
            const base_campaign = "EXCEL_CONSOLIDATED_SYNC";
            // METADATA TUNNELING: We pack the metadata into the ID so the Dashboard can parse it,
            // but the Dashboard UI will only show the clean "EXCEL_CONSOLIDATED_SYNC" name.
            const campaign_id = `${base_campaign}|[${platform}]|[${industry}]`;
            
            const email_uuid = crypto.randomUUID();
            const trackingUrl = `https://email-dashboard-app.vercel.app/api/track?id=${email_uuid}`;

            console.log(`\n➡️ Processing: ${email} (${platform} | ${industry})`);

            try {
                // A. Log to Supabase (using standard columns to avoid schema mismatch)
                const { error: logError } = await supabase.from('email_logs').insert([{
                    id: email_uuid,
                    email: email,
                    status: 'SENT',
                    campaign_id: campaign_id,
                    sent_at: new Date().toISOString()
                }]);

                if (logError) {
                    console.error(`❌ DB Insert Error for ${email}:`, logError.message);
                    continue;
                }

                // B. Send Email
                await transporter.sendMail({
                    from: `"Rik Agent" <${SENDER_EMAIL}>`,
                    to: email,
                    subject: `Strategic Reachout: ${industry} Perspective (${platform})`,
                    html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; margin: 20px auto;">
                        <h2 style="color: #6366f1; font-size: 24px; margin-bottom: 24px;">Hi ${name},</h2>
                        <p style="font-size: 16px; line-height: 1.6;">I noticed your work in <b>${industry}</b> on <b>${platform}</b>.</p>
                        <p style="font-size: 16px; line-height: 1.6;">It's rare to see such consistency in this field. I'd love to share how our team is helping others in this same space automate their outbound workflows.</p>
                        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
                        <p style="font-size: 14px; color: #64748b;">
                            Test Campaign Reference: <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #4338ca; font-weight: bold;">${campaign_id}</span>
                        </p>
                        <p style="font-size: 14px; color: #94a3b8; font-style: italic;">Powered by Email OS Command Center</p>
                        <img src="${trackingUrl}" width="1" height="1" style="display:none;" />
                    </div>`
                });

                console.log(`✅ Sent and Logged: ${email_uuid}`);

            } catch (err) {
                console.error(`❌ Send Failure for ${email}:`, err.message);
            }
            
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('\n🏁 Blast complete. Refresh your dashboard to see the filters in action!');
    } catch (e) {
        console.error('❌ Excel Read Failure:', e.message);
    }
}

runExcelBlast().catch(console.error);
