require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function scheduleRikTest(offsetMinutes = 10) {
    const campaignId = "RIK_INSTANT_VERIFY_TEST";
    const targetEmail = "krishnapersonaluse4382@gmail.com";

    // Calculate a time slightly in the future (e.g., 5-10 mins from now)
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + (offsetMinutes * 60000));
    const scheduledIso = scheduledTime.toISOString();

    console.log(`\n[RIK TEST]: Scheduling verify email for ${scheduledIso}`);

    const { error } = await supabase
        .from('email_logs')
        .upsert({
            email: targetEmail,
            campaign_id: campaignId,
            status: 'READY',
            scheduled_at: scheduledIso
        }, { onConflict: 'email,campaign_id' });

    if (error) {
        console.error(`[FAILED]: Error: ${error.message}`);
    } else {
        console.log(`[SUCCESS]: Rik test scheduled for ${scheduledIso}.`);
        console.log(`[NOTE]: Ensure GitHub Actions is enabled and the 'production_sender' workflow is active.`);
    }
}

// Set to exactly 2 minutes from now (approx 1:37 AM)
scheduleRikTest(2);
