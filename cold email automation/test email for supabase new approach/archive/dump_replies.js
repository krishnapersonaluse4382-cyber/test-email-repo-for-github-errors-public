require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function dumpReplies() {
    const { data: replies, error } = await supabase
        .from('email_replies')
        .select(`
            id, 
            from_email, 
            subject, 
            replied_at, 
            email_id,
            email_logs (
                campaign_id,
                sent_at
            )
        `)
        .order('replied_at', { ascending: false })
        .limit(10);
    
    if (error) console.error(error);
    else {
        replies.forEach(r => {
            console.log(`Reply from ${r.from_email} at ${r.replied_at}`);
            console.log(`- Linked to Log ID: ${r.email_id}`);
            console.log(`- Campaign: ${r.email_logs?.campaign_id}`);
            console.log(`- Sent at: ${r.email_logs?.sent_at}`);
            console.log('---');
        });
    }
}

dumpReplies();
