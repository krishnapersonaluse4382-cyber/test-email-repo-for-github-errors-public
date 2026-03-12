const nodemailer = require('nodemailer');
require('dotenv').config();

const DASHBOARD_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const DASHBOARD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';

const recipients = [
    'krishnapersonaluse438@gmail.com',
    'krishnapersonaluse4382@gmail.com',
    'krishnapersonaluse4383@gmail.com',
    'krishnapersonaluse4384@gmail.com',
    'prajapatirvk6@gmail.com'
];

const batches = [
    { senderAgent: 'Ryan', user: process.env.RYAN_USER, pass: process.env.RYAN_PASS, campaign: 'BATCH_TEST_SAAS' },
    { senderAgent: 'Rik', user: process.env.RIK_USER, pass: process.env.RIK_PASS, campaign: 'BATCH_TEST_ECOM' },
    { senderAgent: 'Krishna', user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS, campaign: 'BATCH_TEST_REAL_ESTATE' },
    { senderAgent: 'Krishna', user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS, campaign: 'BATCH_TEST_HEALTHCARE' }
];

async function run20EmailTest() {
    console.log("🚀 Starting 20-Email Batch Test...");

    for (const batch of batches) {
        console.log(`\n📦 Processing Batch: ${batch.campaign} (Sender: ${batch.senderAgent})`);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: batch.user, pass: batch.pass }
        });

        for (const email of recipients) {
            const email_id = `BATCH_${Date.now()}_${batch.campaign}_${email.split('@')[0]}`;
            const trackingUrl = `https://email-tracker-v2.vercel.app/api/track?id=${email_id}`;

            try {
                // 1. Send Email
                await transporter.sendMail({
                    from: `"${batch.senderAgent} Agent" <${batch.user}>`,
                    to: email,
                    subject: `Stress Test: ${batch.campaign}`,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <p>Hello,</p>
                            <p>This is a batch test email for <b>${batch.campaign}</b>.</p>
                            <p>Tracking with 30s Anti-Ghost window active.</p>
                            <img src="${trackingUrl}" width="1" height="1" style="display:none;" />
                        </div>
                    `
                });

                // 2. Sync to Dashboard
                await fetch(`${DASHBOARD_URL}/rest/v1/email_sent`, {
                    method: 'POST',
                    headers: {
                        'apikey': DASHBOARD_KEY,
                        'Authorization': `Bearer ${DASHBOARD_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        email_id: email_id,
                        recipient: email,
                        subject: `Stress Test: ${batch.campaign}`,
                        sender: batch.user,
                        sent_at: new Date().toISOString(),
                        category: batch.campaign,
                        lead_source: 'Batch_Stress_Test'
                    })
                });

                console.log(`   ✅ Sent -> ${email}`);
            } catch (err) {
                console.error(`   ❌ Failed -> ${email}:`, err.message);
            }
        }
    }
    console.log("\n🏁 ALL 20 EMAILS SENT. Please wait 45 seconds before opening any to verify 0% ghost rate.");
}

run20EmailTest();
