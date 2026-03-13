const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("❌ CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing from environment variables.");
    console.error("If running in GitHub Actions, ensure you have added these to Repository Secrets.");
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const accounts = [
    { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    { user: process.env.RYAN_USER, pass: process.env.RYAN_PASS },
    { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
].filter(acc => acc.user && acc.pass);

async function syncReplies() {
    console.log(`🚀 [${new Date().toISOString()}] Starting Production Reply Sync...`);

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

                // For production, we scan the last 24 hours to ensure no misses
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                imap.search(['ALL', ['SINCE', yesterday]], (err, results) => {
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
                                const messageId = mail.messageId;
                                const inReplyTo = mail.inReplyTo;

                                await checkAndLogReply(fromEmail, acc.user, subject, date, messageId, inReplyTo);
                                
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

                    f.once('end', () => {});
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

async function checkAndLogReply(fromEmail, toAccount, subject, date, messageId, inReplyTo) {
    // Identity + Time Logic
    // Find the most recent send to this email that happened BEFORE the reply
    const { data: latestSend } = await supabase
        .from('email_logs')
        .select('id, email, campaign_id, sent_at')
        .eq('email', fromEmail)
        .lt('sent_at', new Date(date).toISOString())
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (latestSend) {
        console.log(`🎯 Match: ${fromEmail} replied to ${latestSend.campaign_id}`);
        
        const { error: insertError } = await supabase
            .from('email_replies')
            .upsert({
                email_id: latestSend.id,
                from_email: fromEmail,
                to_email: toAccount,
                subject: subject,
                replied_at: date,
                message_id: messageId 
            }, { onConflict: 'message_id' });

        if (insertError) {
            console.error('❌ Insert error:', insertError.message);
        } else {
            console.log(`✅ Logged reply from ${fromEmail}`);
        }
    }
}

syncReplies();
