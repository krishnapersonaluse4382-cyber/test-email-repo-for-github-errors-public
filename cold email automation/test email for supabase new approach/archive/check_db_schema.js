const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../email-dashboard-app/.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('email_logs').select('*').limit(1);
    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }
    console.log('Columns found in first record:', Object.keys(data[0] || {}));
}

check();
