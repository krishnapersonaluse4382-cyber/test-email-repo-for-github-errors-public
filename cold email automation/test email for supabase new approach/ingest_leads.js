require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * PRODUCTION INGESTION GUIDE:
 * 1. Define your Campaign ID.
 * 2. Define the Sender Account (KRISHNA, RYAN, or RIK).
 * 3. Define the Subject and Body.
 * 4. provide the list of lead emails.
 */

async function ingestLeads() {
    const campaignId = "V8_BULLETPROOF_SYNC_PROOF"; // UPDATE THIS FOR EACH CAMPAIGN
    const senderAccount = "RIK"; // KRISHNA, RYAN, or RIK
    const subject = "Final Production Verification - It Works!";
    const body = `Hello! 
    
This is a verification email from the RIK account to confirm the automated pipeline is now live and stable.
    
Best,
The Team`;

    const leads = [
        "krishnapersonaluse438@gmail.com"
        // Add more lead emails here
    ];

    console.log(`🚀 Ingesting ${leads.length} leads for Campaign: ${campaignId}`);

    for (const email of leads) {
        const id = crypto.randomUUID();
        
        const { error } = await supabase
            .from('email_logs')
            .upsert({
                id: id,
                email: email,
                campaign_id: campaignId,
                status: 'READY',
                sender_account: senderAccount,
                subject: subject,
                body: body,
                created_at: new Date().toISOString()
            }, { onConflict: 'email,campaign_id' });

        if (error) {
            console.error(`❌ Failed to ingest ${email}:`, error.message);
        } else {
            console.log(`✅ ${email} is READY to be sent.`);
        }
    }

    console.log("🏁 Ingestion step finished.");
}

ingestLeads();
