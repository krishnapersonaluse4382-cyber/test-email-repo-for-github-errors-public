const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:\\Users\\praja\\.gemini\\antigravity\\My projects\\Workspace - 2\\cold email automation\\test email for supabase new approach\\.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    console.log("--- RECENT EMAIL LOGS ---");
    const { data: logs } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(5);
    console.log(JSON.stringify(logs, null, 2));

    console.log("\n--- RECENT EMAIL REPLIES ---");
    const { data: replies } = await supabase
        .from('email_replies')
        .select('*')
        .order('replied_at', { ascending: false })
        .limit(5);
    console.log(JSON.stringify(replies, null, 2));
}

check();
