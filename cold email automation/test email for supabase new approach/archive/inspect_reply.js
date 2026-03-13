const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:\\Users\\praja\\.gemini\\antigravity\\My projects\\Workspace - 2\\cold email automation\\test email for supabase new approach\\.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data: replies } = await supabase
        .from('email_replies')
        .select('*')
        .order('replied_at', { ascending: false })
        .limit(1);
    
    if (replies && replies.length > 0) {
        console.log("LAST REPLY IN DB:");
        console.log(JSON.stringify(replies[0], null, 2));
    } else {
        console.log("NO REPLIES FOUND");
    }
}

check();
