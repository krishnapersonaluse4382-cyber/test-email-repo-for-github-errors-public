require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkStatus() {
    console.log(`\n[DIAGNOSTIC] Checking Supabase at ${new Date().toISOString()}...`);

    const { data: leads, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('scheduled_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.table(leads.map(l => ({
        email: l.email,
        status: l.status,
        scheduled: l.scheduled_at,
        started: l.started_at,
        sent: l.sent_at,
        campaign: l.campaign_id
    })));
}

checkStatus();
