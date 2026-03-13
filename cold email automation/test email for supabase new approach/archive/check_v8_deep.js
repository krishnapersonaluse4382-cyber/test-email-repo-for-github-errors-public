require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkEverything() {
    console.log('--- 1. Checking V8 Log State ---');
    const { data: v8Logs } = await supabase
        .from('email_logs')
        .select('*')
        .eq('campaign_id', 'HYBRID_VERIFY_V8');
    console.log('V8 Logs:', v8Logs);

    if (v8Logs && v8Logs.length > 0) {
        const leadEmail = v8Logs[0].email;
        console.log(`\n--- 2. Checking all sends to ${leadEmail} ---`);
        const { data: allSends } = await supabase
            .from('email_logs')
            .select('id, campaign_id, sent_at, status')
            .eq('email', leadEmail)
            .order('sent_at', { ascending: false });
        console.log(allSends);

        console.log(`\n--- 3. Checking all replies from ${leadEmail} ---`);
        const { data: allReplies } = await supabase
            .from('email_replies')
            .select('*')
            .eq('from_email', leadEmail)
            .order('replied_at', { ascending: false });
        console.log(allReplies);
    }
}

checkEverything();
