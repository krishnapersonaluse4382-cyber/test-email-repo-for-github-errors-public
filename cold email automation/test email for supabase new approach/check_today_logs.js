require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .gte('started_at', '2026-03-12T00:00:00Z')
        .order('started_at', { ascending: false });
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Logs from Today:', data.map(l => ({ id: l.id, email: l.email, campaign: l.campaign_id, status: l.status, started_at: l.started_at })));
    }
}

check();
