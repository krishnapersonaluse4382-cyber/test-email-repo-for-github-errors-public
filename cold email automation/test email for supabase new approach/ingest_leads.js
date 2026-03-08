require('dotenv').config();
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function ingestExcelLeads() {
    const excelPath = 'C:\\Users\\praja\\Downloads\\emails execl supabase test.xlsx';
    console.log(`Reading Excel: ${excelPath}`);

    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const campaignId = "MULTI_SENDER_CAMPAIGN_001";

    console.log(`Found ${data.length} rows. filtering valid emails...`);

    for (const row of data) {
        const email = row['Emails'];
        const name = row['Name'];

        if (!email || !email.includes('@')) continue;

        console.log(`Checking/Ingesting: ${email} (${name})`);

        // We add them to Supabase so the Sender Engine can pick them up
        const { data: existing } = await supabase
            .from('email_logs')
            .select('status')
            .eq('email', email)
            .eq('campaign_id', campaignId)
            .maybeSingle();

        if (!existing) {
            const { error } = await supabase
                .from('email_logs')
                .insert({
                    email: email,
                    campaign_id: campaignId,
                    status: 'READY' // Custom status for our loop
                });
            if (error) console.error(`Error inserting ${email}:`, error);
            else console.log(`[READY]: ${email} added to campaign.`);
        } else {
            console.log(`[SKIP]: ${email} already in database (${existing.status})`);
        }
    }
    console.log("--- INGESTION COMPLETE ---");
}

ingestExcelLeads();
