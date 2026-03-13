require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkStatus() {
    const { data, count, error } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Total Leads in DB:", count);
    console.log("Recent Leads:", JSON.stringify(data.slice(-5), null, 2));
}

checkStatus();
