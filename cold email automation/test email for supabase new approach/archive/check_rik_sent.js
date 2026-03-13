require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSent() {
    console.log('--- Searching for emails sent to Rik ---');
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('email', 'rik@contentelevators.org')
        .order('sent_at', { ascending: false });
    
    if (error) console.error(error);
    else console.log(data);
}

checkSent();
