require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('email_logs').select('*').limit(1);
    
    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in email_logs:', Object.keys(data[0]));
    } else {
        console.log('No data to check schema.');
    }
}

checkSchema();
