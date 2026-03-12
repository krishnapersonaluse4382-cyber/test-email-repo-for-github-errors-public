require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function injectFinalTest() {
    console.log("💉 Injecting FINAL clean test lead...");
    
    const id = crypto.randomUUID();
    const email = 'krishnapersonaluse4382@gmail.com';
    
    const { error } = await supabase
        .from('email_logs')
        .insert({
            id: id,
            email: email,
            status: 'READY',
            campaign_id: 'FINAL_CLOUD_VERIFY_FIXED_001',
            scheduled_at: new Date().toISOString()
        });

    if (error) {
        console.error(`❌ Injection failed:`, error.message);
    } else {
        console.log(`✅ Lead ${email} is READY.`);
        console.log(`📌 Lead ID for tracking: ${id}`);
        console.log("\n1. Please update your Line 79 in Supabase first.");
        console.log("2. Then wait for the email to arrive.");
    }
}

injectFinalTest();
