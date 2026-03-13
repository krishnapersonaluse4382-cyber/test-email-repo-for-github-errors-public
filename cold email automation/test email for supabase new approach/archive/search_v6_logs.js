
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function searchV6() {
    console.log("Searching for campaign: THREAD_AWARE_VERIFY_V6...");

    const { data: logs, error: logError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('campaign_id', 'THREAD_AWARE_VERIFY_V6');

    if (logError) {
        console.error('Error:', logError);
        return;
    }

    console.log(`Found ${logs.length} logs.`);
    logs.forEach(log => {
        console.log(`Email: ${log.email}, MsgID: ${log.message_id}, SentAt: ${log.sent_at}, ID: ${log.id}`);
    });
}

searchV6();
