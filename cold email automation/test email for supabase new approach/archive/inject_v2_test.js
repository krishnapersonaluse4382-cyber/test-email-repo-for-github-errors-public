require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const testLead = {
    email: 'krishnapersonaluse4382@gmail.com',
    campaign_id: 'STRICT_ID_V2_VERIFY',
    status: 'READY',
    scheduled_at: new Date().toISOString(),
    assigned_agent: 'RA_SYSTEM'
};

async function inject() {
    console.log('Injecting test lead for STRICT_ID_V2_VERIFY...');
    const { data, error } = await supabase
        .from('email_logs')
        .insert([testLead])
        .select();

    if (error) {
        console.error('Error injecting lead:', error.message);
    } else {
        console.log('Successfully injected lead:', data[0].id);
    }
}

inject();
