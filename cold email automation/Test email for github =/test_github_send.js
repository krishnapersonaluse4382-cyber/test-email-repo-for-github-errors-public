const nodemailer = require('nodemailer');

async function sendTestEmail() {
    console.log('--- STARTING GITHUB COMPARISON TEST ---');
    
    // We use the same configuration that caused issues before
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'krishnapersonaluse438@gmail.com',
            pass: process.env.KRISHNA_PASS // This is what you must re-add to GitHub Secrets
        }
    });

    const mailOptions = {
        from: '"Antigravity Test" <krishnapersonaluse438@gmail.com>',
        to: 'krishnapersonaluse438@gmail.com',
        subject: 'GITHUB TEST: Old Pipeline Comparison',
        text: 'This is a test email sent via GitHub Actions to compare with the new Local/Supabase system.'
    };

    try {
        console.log('Attempting to send email via GitHub...');
        const info = await transporter.sendMail(mailOptions);
        console.log('SUCCESS: Email sent!', info.messageId);
        
        // This is the "State Sync" part that usually fails or loops
        console.log('Simulating State Sync... (This is where the Technical Mess usually starts)');
    } catch (error) {
        console.error('FAILED:', error.message);
        process.exit(1); // Force failure to simulate how GitHub sees it
    }
}

sendTestEmail();
