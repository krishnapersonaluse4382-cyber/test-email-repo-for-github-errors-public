const nodemailer = require('nodemailer');
require('dotenv').config();

async function runTest() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.RIK_USER,
            pass: process.env.RIK_PASS
        }
    });

    const target = 'krishnapersonaluse438@gmail.com';

    // 1. PURE PLAIN TEXT
    await transporter.sendMail({
        from: '"Rik (Pure Text Test)" <' + process.env.RIK_USER + '>',
        to: target,
        subject: 'Test A: Pure Plain Text',
        text: "Hi Krishna,\n\nThis is a 100% pure plain text email. No HTML, no tracking, just characters.\n\nBest,\nRik"
    });
    console.log("Sent Email A (Pure Text)");

    // 2. STEALTH HTML + PIXEL
    await transporter.sendMail({
        from: '"Rik (Stealth HTML Test)" <' + process.env.RIK_USER + '>',
        to: target,
        subject: 'Test B: Stealth HTML + Pixel',
        text: "Hi Krishna,\n\nThis is a Stealth HTML email. It looks exactly like Test A to you, but it contains a hidden tracking pixel to detect the open.\n\nBest,\nRik",
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #333;">
                Hi Krishna,<br><br>
                This is a Stealth HTML email. It looks exactly like Test A to you, but it contains a hidden tracking pixel to detect the open.<br><br>
                Best,<br>
                Rik
            </div>
            <img src="https://email-tracker-v2.vercel.app/api/track?id=STYLE_TEST_PIXEL" width="1" height="1" style="display:none !important;" />
        `
    });
    console.log("Sent Email B (Stealth HTML)");
}

runTest().catch(console.error);
