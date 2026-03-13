require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkOpens() {
    const { data, error } = await supabase
        .from('email_opens')
        .select('*')
        .eq('email_id', '2a722d37-5f8e-416f-983f-215ec510963a');
    
    if (error) console.error(error);
    else console.log('Opens for V8:', data);
}

checkOpens();
