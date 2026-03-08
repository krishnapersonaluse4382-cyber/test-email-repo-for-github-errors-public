require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function scheduleTest() {
    const campaignId = "HEADLESS_TEST_001";
    const targetEmail = "krishnapersonaluse438@gmail.com";

    // We create the timestamps based on TODAY (March 9, 2026) in the user's timezone (+05:30)
    // 2:30 AM -> 2026-03-09T02:30:00+05:30
    // 5:46 AM -> 2026-03-09T05:46:00+05:30
    // 11:02 AM -> 2026-03-09T11:02:00+05:30

    const testRuns = [
        { email: targetEmail, scheduled_at: "2026-03-09T02:30:00+05:30" },
        { email: targetEmail, scheduled_at: "2026-03-09T05:46:00+05:30" },
        { email: targetEmail, scheduled_at: "2026-03-09T11:02:00+05:30" }
    ];

    console.log(`\n[SCHEDULER]: Preparing 3 Headless Tests for ${targetEmail}`);
    console.log(`[!] CRITICAL: Ensure 'scheduled_at' column (TIMESTAMPTZ) exists in 'email_logs' table.\n`);

    for (const run of testRuns) {
        // Use a unique campaign ID per slot so upsert doesn't merge them if using (email, campaign_id) constraint
        // Or just use a unique suffix
        const slotCampaignId = `${campaignId}_${run.scheduled_at.split('T')[1].replace(/:/g, '')}`;

        const { error } = await supabase
            .from('email_logs')
            .upsert({
                email: run.email,
                campaign_id: slotCampaignId,
                status: 'READY',
                scheduled_at: run.scheduled_at
            }, { onConflict: 'email,campaign_id' });

        if (error) {
            console.error(`[FAILED]: Could not schedule ${run.scheduled_at}. Error: ${error.message}`);
            if (error.message.includes('column "scheduled_at" does not exist')) {
                console.log("\n>>> ACTION REQUIRED: Run this SQL in Supabase Dashboard:");
                console.log("ALTER TABLE email_logs ADD COLUMN scheduled_at TIMESTAMPTZ;");
            }
        } else {
            console.log(`[READY]: Scheduled for ${run.scheduled_at} (Campaign: ${slotCampaignId})`);
        }
    }

    console.log("\n[COMPLETE]: All test leads injected into Supabase.");
}

scheduleTest();
