require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function ingestScheduledTest() {
    const campaignId = "SCHEDULED_INTERVAL_TEST_001";
    const leads = [
        "krishnapersonaluse438@gmail.com",
        "krishnapersonaluse4382@gmail.com",
        "prajapatirvk6@gmail.com"
    ];

    console.log(`Ingesting 3 leads for scheduled test: ${campaignId}`);

    for (const email of leads) {
        const { error } = await supabase
            .from('email_logs')
            .upsert({
                email: email,
                campaign_id: campaignId,
                status: 'READY'
            }, { onConflict: 'email,campaign_id' });

        if (error) console.error(`Error ingesting ${email}:`, error);
        else console.log(`[READY]: ${email} prepared.`);
    }
}

ingestScheduledTest();
