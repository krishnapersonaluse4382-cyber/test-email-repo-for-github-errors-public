require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const testLeads = [
    { email: 'krishnapersonaluse4382@gmail.com' },
    { email: 'krishnapersonaluse4384@gmail.com' }
];

async function injectLeads() {
    console.log("💉 Injecting Cloud-Ready leads into email_logs...");
    
    const campaignId = 'PC_OFF_TEST_' + new Date().toISOString().split('T')[0];
    
    for (const lead of testLeads) {
        const id = crypto.randomUUID();
        const { error } = await supabase
            .from('email_logs')
            .insert({
                id: id,
                email: lead.email,
                status: 'READY',
                campaign_id: campaignId,
                scheduled_at: new Date().toISOString()
            });

        if (error) console.error(`❌ Failed for ${lead.email}:`, error.message);
        else console.log(`✅ ${lead.email} is now READY. Cloud will pick it up.`);
    }
    
    console.log("\n🚀 System is now fully armed. You can close your PC.");
}

injectLeads();
