const XLSX = require('xlsx');
const fs = require('fs');
require('dotenv').config({ path: '../../.env' }); // Adjusted path to root env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

const filePath = 'C:\\Users\\praja\\.gemini\\antigravity\\My projects\\Workspace - 2\\cold email automation\\supabase + cronjobs\\excel\\full list for testing.xlsx';

async function ingest() {
    try {
        console.log(`📂 Reading Excel file...`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`🚀 Preparing ${data.length} leads...`);

        const leads = data.map((row, idx) => {
            const dna = ['A', 'B', 'C'][idx % 3];
            const agent = ['Krishna', 'Ryan', 'Rik'][idx % 3];

            return {
                email: row.Emails,
                first_name: row.Name,
                status: 'PENDING',
                campaign_name: 'PILOT_TEST_MARCH',
                dna_structure: dna,
                assigned_agent: agent,
                industry: 'Tech/Digital',
                lead_source: 'Excel Import',
                created_at: new Date().toISOString()
            };
        });

        console.log(`📡 Sending to Supabase REST API...`);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/leads_to_email`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(leads)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Supabase API Error: ${response.status} ${errText}`);
        }

        console.log(`✅ Successfully ingested ${leads.length} leads into 'leads_to_email' table.`);
    } catch (err) {
        console.error('❌ Ingestion Error:', err.message);
    }
}

ingest();
