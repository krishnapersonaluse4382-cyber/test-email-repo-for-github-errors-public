const nodemailer = require('nodemailer');
require('dotenv').config();

// Using the same verified credentials and dashboard connection
const DASHBOARD_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const DASHBOARD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';

const recipients = [
    'krishnapersonaluse438@gmail.com',
    'krishnapersonaluse4382@gmail.com',
    'krishnapersonaluse4383@gmail.com',
    'krishnapersonaluse4384@gmail.com',
    'prajapatirvk6@gmail.com'
];

const CAMPAIGN_NAME = 'ULTIMATE_GHOST_FIX_V1';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.RYAN_USER,
        pass: process.env.RYAN_PASS
    }
});

async function runStressTest() {
    console.log(`🚀 Starting Stress Test: Sending 5 emails from ${process.env.RYAN_USER}...`);

    for (const email of recipients) {
        const email_id = `STRESS_${Date.now()}_${email.split('@')[0]}`;
        const trackingUrl = `https://email-tracker-v2.vercel.app/api/track?id=${email_id}`;

        try {
            // 1. Send the actual email
            await transporter.sendMail({
                from: `"Ryan Agent" <${process.env.RYAN_USER}>`,
                to: email,
                subject: 'Final Verification: Stress Test Ryan V1',
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <p>Hello,</p>
                        <p>This is a final verification email for the stress test campaign: <b>${CAMPAIGN_NAME}</b>.</p>
                        <p>Open this email to verify that real-time tracking is active.</p>
                        <img src="${trackingUrl}" width="1" height="1" style="display:none;" />
                    </div>
                `
            });

            // 2. Log to the dashboard
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
                    subject: 'Final Verification: Stress Test Ryan V1',
                    sender: process.env.RYAN_USER,
                    sent_at: new Date().toISOString(),
                    category: CAMPAIGN_NAME,
                    lead_source: 'Ryan_Stress_Test'
                })
            });

            console.log(`✅ Sent to: ${email}`);
        } catch (err) {
            console.error(`❌ Failed for ${email}:`, err.message);
        }
    }

    console.log('\n🏁 STRESS TEST COMPLETE. Check Vercel under folder: ' + CAMPAIGN_NAME);
}

runStressTest();
