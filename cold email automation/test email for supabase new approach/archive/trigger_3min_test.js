require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function scheduleInstantTest() {
    const targetEmail = "krishnapersonaluse4382@gmail.com";

    // Set scheduled_at to 3 minutes from now
    const now = new Date();
    const threeMinutesLater = new Date(now.getTime() + 3 * 60 * 1000);
    const scheduledAt = threeMinutesLater.toISOString();

    console.log(`[TEST]: Scheduling test email for ${scheduledAt}...`);

    const { error } = await supabase
        .from('email_logs')
        .insert({
            email: targetEmail,
            campaign_id: "SUPABASE_CLOUD_STANDALONE_TEST",
            status: 'READY',
            scheduled_at: scheduledAt
        });

    if (error) {
        console.error("[ERROR]:", error.message);
    } else {
        console.log(`[SUCCESS]: Test lead injected. It will be READY in 3 minutes.`);
        console.log(`[!!!] IMPORTANT: You MUST trigger the Edge Function via the Supabase Dashboard now.`);
    }
}

scheduleInstantTest();
