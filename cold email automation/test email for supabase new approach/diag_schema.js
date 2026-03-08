require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSchema() {
    console.log("Checking email_logs schema...");
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching table:", error.message);
    } else {
        console.log("Fetched 1 row or table is empty. Columns in response objects:");
        if (data && data.length > 0) {
            console.log(Object.keys(data[0]));
        } else {
            console.log("No data found to inspect columns. Need to use RPC or just trust the error.");
        }
    }
}

checkSchema();
