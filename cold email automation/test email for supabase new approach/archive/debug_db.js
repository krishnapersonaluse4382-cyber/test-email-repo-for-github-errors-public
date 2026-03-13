const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    console.log('Checking connection to:', process.env.SUPABASE_URL);
    const { count, error } = await supabase.from('email_logs').select('*', { count: 'exact', head: true });
    if (error) {
        console.error('❌ Error checking email_logs:', error.message);
    } else {
        console.log('✅ Found', count, 'rows in email_logs');
    }

    const { count: opensCount, error: opensError } = await supabase.from('email_opens').select('*', { count: 'exact', head: true });
    if (opensError) {
        console.error('❌ Error checking email_opens:', opensError.message);
    } else {
        console.log('✅ Found', opensCount, 'rows in email_opens');
    }
}

check();
