const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const accounts = [
    { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    { user: process.env.RYAN_USER, pass: process.env.RYAN_PASS },
    { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
].filter(acc => acc.user && acc.pass);

async function syncReplies() {
    console.log(`🚀 Starting Reply Sync for ${accounts.length} accounts...`);

    for (const acc of accounts) {
        try {
            await processAccount(acc);
        } catch (err) {
            console.error(`❌ Error processing account ${acc.user}:`, err.message);
        }
    }

    console.log('✅ Sync Completed.');
}

function processAccount(acc) {
    return new Promise((resolve, reject) => {
        const imap = new Imap({
            user: acc.user,
            password: acc.pass,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        });

        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);
        }

        imap.once('ready', () => {
            openInbox((err, box) => {
                if (err) return reject(err);

                // Search for all messages since yesterday to find replies
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 2); // 2 days back to be safe
                
                imap.search(['ALL', ['SINCE', yesterday.toISOString()]], (err, results) => {
                    if (err) return reject(err);

                    if (!results || results.length === 0) {
                        console.log(`[${acc.user}] No new messages found.`);
                        imap.end();
                        return resolve();
                    }

                    const f = imap.fetch(results, { bodies: '' });
                    let processed = 0;

                    f.on('message', (msg, seqno) => {
                        msg.on('body', (stream, info) => {
                            simpleParser(stream, async (err, mail) => {
                                if (err) return;

                                const fromEmail = mail.from.value[0].address;
                                const subject = mail.subject;
                                const date = mail.date;
                                const body = mail.text || '';
                                const messageId = mail.messageId;

                                // Check if this is a reply (usually contains 'Re:' or In-Reply-To)
                                // But more importantly, check if the sender is someone we contact
                                await checkAndLogReply(fromEmail, acc.user, subject, body, date, messageId);
                                
                                processed++;
                                if (processed === results.length) {
                                    imap.end();
                                }
                            });
                        });
                    });

                    f.once('error', (err) => {
                        console.error('Fetch error:', err);
                        imap.end();
                    });

                    f.once('end', () => {
                        console.log(`[${acc.user}] Done fetching ${results.length} messages.`);
                    });
                });
            });
        });

        imap.once('error', (err) => {
            reject(err);
        });

        imap.once('end', () => {
            resolve();
        });

        imap.connect();
    });
}

async function checkAndLogReply(fromEmail, toAccount, subject, body, date, messageId) {
    // 1. Identify which SPECIFIC email send this is a reply to.
    // We look for the MOST RECENT send that happened BEFORE the reply date.
    const { data: lead, error: leadError } = await supabase
        .from('email_logs')
        .select('id, email, campaign_id, sent_at')
        .eq('email', fromEmail)
        .lt('sent_at', new Date(date).toISOString()) // MUST have been sent before the reply
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (leadError || !lead) {
        console.log(`[REPLY SKIP]: No matching send found for ${fromEmail} before ${date}`);
        return; 
    }

    console.log(`🎯 Found reply from lead: ${fromEmail} to ${toAccount}`);

    // 2. Log to 'email_replies'
    const { error: insertError } = await supabase
        .from('email_replies')
        .upsert({
            email_id: lead.id,
            from_email: fromEmail,
            to_email: toAccount,
            subject: subject,
            replied_at: date,
            message_id: messageId // Use this for deduplication
        }, { onConflict: 'message_id' });

    if (insertError) {
        if (insertError.code === 'PGRST116') {
            // Likely table doesn't exist yet, which we know
            console.error('❌ email_replies table still missing.');
        } else {
            console.error('❌ Insert error:', insertError.message);
        }
    } else {
        console.log(`✅ Logged reply from ${fromEmail}`);
    }
}

syncReplies();
