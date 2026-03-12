require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('campaign_id', 'LIVE_FIX_VERIFICATION');
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('LIVE_FIX_VERIFICATION Logs:', data);
    }
}

check();
