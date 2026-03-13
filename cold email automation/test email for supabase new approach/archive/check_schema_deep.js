require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSchema() {
    console.log('--- Checking email_logs ---');
    const { data: logs, error: logsError } = await supabase.from('email_logs').select('*').limit(1);
    if (logsError) console.error('Error logs:', logsError.message);
    else console.log('email_logs sample:', logs);

    console.log('--- Checking email_opens ---');
    const { data: opens, error: opensError } = await supabase.from('email_opens').select('*').limit(1);
    if (opensError) console.error('Error opens:', opensError.message);
    else console.log('email_opens sample:', opens);

    console.log('--- Checking email_clicks ---');
    const { data: clicks, error: clicksError } = await supabase.from('email_clicks').select('*').limit(1);
    if (clicksError) console.error('Error clicks:', clicksError.message);
    else console.log('email_clicks sample:', clicks);

    console.log('--- Checking email_replies ---');
    const { data: replies, error: repliesError } = await supabase.from('email_replies').select('*').limit(1);
    if (repliesError) console.error('Error replies:', repliesError.message);
    else console.log('email_replies sample:', replies);
}

checkSchema();
