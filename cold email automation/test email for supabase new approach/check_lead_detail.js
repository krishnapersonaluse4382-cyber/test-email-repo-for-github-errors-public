require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('status', 'READY')
        .limit(1);
    
    if (error || !data) {
        console.error('Error:', error);
    } else {
        console.log('READY Lead Detail:', data[0]);
    }
}

check();
