const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:/Users/praja/.gemini/antigravity/My projects/Workspace - 2/cold email automation/supabase + cronjobs/excel/full list for testing.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
} catch (error) {
    console.error('Error reading excel file:', error);
}
