require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Last 10 Logs:', data.map(l => ({ id: l.id, email: l.email, campaign: l.campaign_id, started_at: l.started_at })));
    }
}

check();
