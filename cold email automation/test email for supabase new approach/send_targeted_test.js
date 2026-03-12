const nodemailer = require('nodemailer');
require('dotenv').config();

const DASHBOARD_URL = 'https://psqebjafyjrtxarphkej.supabase.co';
const DASHBOARD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWViamFmeWpydHhhcnBoa2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjY4NTEsImV4cCI6MjA4NzUwMjg1MX0.2A8zmceqZP3azTzTvviqA6O2gFSGSG5WbmYk60q86wY';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
});

async function sendTest() {
    const email_id = 'HEADER_DEBUG_' + Date.now();
    const recipient = 'prajapatirvk6@gmail.com';
    const campaign = 'DEBUG_HEADERS';

    console.log(`1. Sending Stealth HTML Email to ${recipient}...`);

    const trackingUrl = `https://email-tracker-v2.vercel.app/api/track?id=${email_id}`;
    await transporter.sendMail({
        from: `"Rik Agent" <${process.env.RIK_USER}>`,
        to: recipient,
        subject: 'Real-Time Tracking Verification - Target 3',
        text: `This is a test email for campaign ${campaign}.`,
        html: `<div style="font-family: sans-serif; color: #333;">
            <p>This is a test email for campaign <b>${campaign}</b>.</p>
            <p>Once you open this, the tracking pixel will fire and you will see "1 Open" in Vercel.</p>
            <img src="${trackingUrl}" width="1" height="1" style="display:none;" />
        </div>`
    });

    console.log('2. Syncing to Dashboard Database...');
    const syncRes = await fetch(`${DASHBOARD_URL}/rest/v1/email_sent`, {
        method: 'POST',
        headers: {
            'apikey': DASHBOARD_KEY,
            'Authorization': `Bearer ${DASHBOARD_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            email_id: email_id,
            recipient: recipient,
            subject: 'Real-Time Tracking Verification - Target 3',
            sender: process.env.RIK_USER,
            sent_at: new Date().toISOString(),
            category: campaign,
            lead_source: 'Fixed_Tracking_Verification'
        }),
        signal: AbortSignal.timeout(5000)
    });

    if (syncRes.ok) {
        console.log('✅ DONE. Check ' + recipient + ' and refresh Vercel!');
    } else {
        console.log('❌ Sync Failed:', await syncRes.text());
    }
}

sendTest();
