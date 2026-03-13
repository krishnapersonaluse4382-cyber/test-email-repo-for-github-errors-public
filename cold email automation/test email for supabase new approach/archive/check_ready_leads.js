require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, count, error } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact' })
        .eq('status', 'READY');
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('READY Leads Count:', count);
        console.log('Sample Leads:', data.slice(0, 5).map(l => l.email));
    }
}

check();
