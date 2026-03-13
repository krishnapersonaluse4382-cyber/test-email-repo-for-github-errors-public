require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkLastReply() {
    const { data: replies, error } = await supabase
        .from('email_replies')
        .select(`
            id, 
            replied_at, 
            from_email,
            email_id,
            email_logs (
                campaign_id,
                sent_at,
                id
            )
        `)
        .order('replied_at', { ascending: false })
        .limit(1);
    
    if (error) console.error(error);
    else {
        const r = replies[0];
        console.log('--- LATEST REPLY LOGGED ---');
        console.log('From:', r.from_email);
        console.log('Replied At:', r.replied_at);
        console.log('Linked to Log ID:', r.email_id);
        console.log('Campaign ID:', r.email_logs?.campaign_id);
        console.log('Send Time:', r.email_logs?.sent_at);
        console.log('---------------------------');
    }
}

checkLastReply();
