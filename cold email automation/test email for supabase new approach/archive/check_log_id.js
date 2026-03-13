const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:\\Users\\praja\\.gemini\\antigravity\\My projects\\Workspace - 2\\cold email automation\\test email for supabase new approach\\.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data: log } = await supabase
        .from('email_logs')
        .select('*')
        .eq('id', '3aec5beb-4722-4298-a528-0e2fcbd97446')
        .single();
    
    console.log("MATCHING EMAIL LOG:");
    console.log(JSON.stringify(log, null, 2));
}

check();
