const XLSX = require('xlsx');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

// Using forward slashes to avoid escape character issues in Windows paths
const filePath = 'C:/Users/praja/.gemini/antigravity/My projects/Workspace - 2/cold email automation/supabase + cronjobs/excel/full list for testing.xlsx';

async function ingest() {
    try {
        console.log(`📂 Reading Excel file: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`🚀 Preparing ${data.length} leads with Industry, Country, and Notes...`);

        const leads = data.map((row, idx) => {
            const combinations = [
                { dna: 'A', agent: 'Ryan', details: 'Interest-Based Hook + Specific Result + Casual' },
                { dna: 'B', agent: 'Krishna', details: 'Direct Pain-Point + Social Proof + Professional' },
                { dna: 'C', agent: 'Rik', details: 'Question-Drive + Emotional Benefit + Short/Punchy' }
            ];
            const combo = combinations[idx % 3];

            return {
                email: row.Emails,
                first_name: row.Name,
                industry: row.Industry || 'Digital/Tech', 
                country: row.Country || 'Global',
                notes: row.Notes || `DNA-${combo.dna}: ${combo.details}`,
                status: 'PENDING',
                campaign_name: 'PILOT_TEST_MARCH',
                dna_structure: combo.dna,
                assigned_agent: combo.agent,
                lead_source: 'Excel Import'
            };
        });

        console.log(`📡 Ingesting into Supabase 'leads_to_email'...`);
        
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

        console.log(`✅ Success! ${leads.length} leads are now in Supabase.`);
    } catch (err) {
        console.error('❌ Ingestion Error:', err.message);
    }
}

ingest();
