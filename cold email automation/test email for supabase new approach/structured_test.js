const nodemailer = require('nodemailer');
require('dotenv').config();
// Using global fetch (standard in modern Node.js)

const DASHBOARD_URL = "https://psqebjafyjrtxarphkej.supabase.co";
const DASHBOARD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY";

async function structuredTest() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
    });

    const target = 'krishnapersonaluse438@gmail.com';
    const emailId = "DEMO_" + Date.now();
    const campaign = "VERIFICATION_TEST_V3";

    console.log("1. Sending Stealth HTML Email...");
    await transporter.sendMail({
        from: '"Rik Agent" <' + process.env.RIK_USER + '>',
        to: target,
        subject: 'Real-Time Verification Test',
        html: `
            <div style="font-family: sans-serif; color: #333;">
                Hi Krishna,<br><br>
                If you see this in the dashboard, the system is now structured correctly.<br><br>
                Best,<br>Rik
            </div>
            <img src="https://email-tracker-v2.vercel.app/api/track?id=${emailId}" width="1" height="1" />
        `
    });

    console.log("2. Syncing to Dashboard Database...");
    await fetch(`${DASHBOARD_URL}/rest/v1/email_sent`, {
        method: 'POST',
        headers: {
            'apikey': DASHBOARD_KEY,
            'Authorization': `Bearer ${DASHBOARD_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email_id: emailId,
            recipient: target,
            sender: process.env.RIK_USER,
            subject: 'Real-Time Verification Test',
            category: campaign,
            lead_source: 'Handshake_Test',
            sent_at: new Date().toISOString()
        })
    });

    console.log("✅ DONE. Go to your Gmail, OPEN the email, and then refresh Vercel!");
}

structuredTest().catch(console.error);
