require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debugV8() {
    console.log('--- V8 Campaign Logs ---');
    const { data: logs, error: logError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('campaign_id', 'HYBRID_VERIFY_V8');
    
    if (logError) console.error(logError);
    else console.log(JSON.stringify(logs, null, 2));

    console.log('\n--- Recent Replies (Last 10) ---');
    const { data: replies, error: replyError } = await supabase
        .from('email_replies')
        .select('*')
        .order('replied_at', { ascending: false })
        .limit(10);

    if (replyError) console.error(replyError.message);
    else console.log(JSON.stringify(replies, null, 2));
}

debugV8();
