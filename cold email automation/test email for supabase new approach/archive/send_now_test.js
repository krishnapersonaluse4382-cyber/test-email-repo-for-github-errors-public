require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendNow() {
    console.log('[TEST] Sending immediate test email from PC...');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"Cold Email Automation" <${process.env.EMAIL_USER}>`,
            to: 'krishnapersonaluse4382@gmail.com',
            subject: 'PC TEST — System is Working (Step 1 of 2)',
            text: `This email was sent RIGHT NOW from your PC using the local Node.js script.

This proves the SMTP connection and Gmail App Password are working correctly.

Next, we will verify the CLOUD sends it after you close your PC.

Sent at: ${new Date().toISOString()}`
        });

        console.log('[SUCCESS] Email sent! Message ID:', info.messageId);
        console.log('[DONE] Check krishnapersonaluse4382@gmail.com inbox now.');
    } catch (err) {
        console.error('[ERROR] Failed to send:', err.message);
    }
}

sendNow();
