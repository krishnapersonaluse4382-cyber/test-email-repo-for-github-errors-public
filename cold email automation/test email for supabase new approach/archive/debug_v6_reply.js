
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkV6() {
    const leadEmail = 'krishnapersonaluse438@gmail.com';
    console.log(`Checking status for ${leadEmail}...`);

    // 1. Find the log entry
    const { data: logs, error: logError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('email', leadEmail)
        .order('sent_at', { ascending: false })
        .limit(1);

    if (logError) {
        console.error('Error fetching logs:', logError);
        return;
    }

    if (!logs || logs.length === 0) {
        console.log('No logs found for this email.');
        return;
    }

    const log = logs[0];
    console.log('--- Email Log ---');
    console.log('ID:', log.id);
    console.log('Campaign:', log.campaign_id);
    console.log('Message ID:', log.message_id);
    console.log('Sent At:', log.sent_at);

    // 2. Find replies linked to this ID
    const { data: replies, error: replyError } = await supabase
        .from('email_replies')
        .select('*')
        .eq('email_id', log.id);

    if (replyError) {
        console.error('Error fetching replies:', replyError);
        return;
    }

    console.log('--- Replies Linked ---');
    if (replies.length === 0) {
        console.log('No replies linked yet.');
    } else {
        replies.forEach(r => {
            console.log(`- From: ${r.from_email}, Subject: ${r.subject}, At: ${r.replied_at}, MsgID: ${r.message_id}`);
        });
    }
}

checkV6();
