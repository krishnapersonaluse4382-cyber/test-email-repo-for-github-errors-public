require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function listTables() {
    const { data, error } = await supabase.from('email_replies').select('*').limit(1);
    
    if (error) {
        console.error('❌ email_replies table missing or error:', error.message);
    } else {
        console.log('✅ email_replies table exists.');
    }

    const { data: opens, error: opensError } = await supabase.from('email_opens').select('*').limit(1);
    if (opensError) console.error('❌ email_opens error:', opensError.message);
    else console.log('✅ email_opens table exists.');
}

listTables();
