
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkV7() {
    const leadEmail = 'krishnapersonaluse438@gmail.com';
    console.log(`Checking status for ${leadEmail}...`);

    // 1. Find the log entry for V7
    const { data: logs, error: logError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('campaign_id', 'STRESS_TEST_V7')
        .eq('email', leadEmail);

    if (logError) {
        console.error('Error fetching logs:', logError);
        return;
    }

    if (!logs || logs.length === 0) {
        console.log('No V7 logs found.');
        return;
    }

    const log = logs[0];
    console.log('--- Email Log (V7) ---');
    console.log('ID:', log.id);
    console.log('Message ID:', log.message_id);

    // 2. Find ALL replies from this email
    const { data: replies, error: replyError } = await supabase
        .from('email_replies')
        .select('*')
        .eq('from_email', leadEmail);

    if (replyError) {
        console.error('Error fetching replies:', replyError);
        return;
    }

    console.log('--- All Replies from Lead ---');
    replies.forEach(r => {
        console.log(`- Linked to Log ID: ${r.email_id}, Match Type: ${r.email_id === log.id ? "✅ TARGET" : "❌ OTHER LOG"}, MsgID: ${r.message_id}`);
    });
}

checkV7();
