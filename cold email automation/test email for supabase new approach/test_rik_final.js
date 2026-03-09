const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function sendRikTest() {
    console.log("🟢 Starting 1-Email Verification (RIK Account)...");

    // 1. Setup RIK Transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.RIK_USER,
            pass: process.env.RIK_PASS
        }
    });

    const mailOptions = {
        from: `"Rik (Verification)" <${process.env.RIK_USER}>`,
        to: 'krishnapersonaluse438@gmail.com',
        subject: 'FINAL SYSTEM VERIFICATION - SUCCESS GUARANTEED',
        text: 'This email proves the system works while the PC is off. Total success.'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email Sent Successfully to krishnapersonaluse438@gmail.com:", info.messageId);

        // Log to Supabase for proof
        await supabase.from('email_logs').insert([{
            email: 'krishnapersonaluse438@gmail.com',
            status: 'SENT',
            sender_account: 'RIK',
            message_id: info.messageId,
            timestamp: new Date()
        }]);

        console.log("💾 Logged to Supabase.");
    } catch (error) {
        console.error("❌ Fatal Error in Rik Test:", error);
        process.exit(1);
    }
}

sendRikTest();
