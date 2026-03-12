const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase.from('email_logs').select('*').ilike('id', 'OPEN_RATE_TEST_%');
    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ Found', data.length, 'test rows:');
        data.forEach(row => console.log(`- ${row.id} | ${row.sent_at} | ${row.campaign_id}`));
    }
}

check();
