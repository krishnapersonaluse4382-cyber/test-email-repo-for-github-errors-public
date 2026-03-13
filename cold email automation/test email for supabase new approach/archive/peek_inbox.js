const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const accounts = [
    { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    { user: process.env.RYAN_USER, pass: process.env.RYAN_PASS },
    { user: process.env.RIK_USER, pass: process.env.RIK_PASS }
].filter(acc => acc.user && acc.pass);

async function peek() {
    for (const acc of accounts) {
        console.log(`--- Peeking into ${acc.user} ---`);
        await new Promise((resolve, reject) => {
            const imap = new Imap({
                user: acc.user,
                password: acc.pass,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }
            });

            imap.once('ready', () => {
                imap.openBox('INBOX', true, (err, box) => {
                    if (err) return resolve();
                    
                    // Search for everything since today
                    const today = new Date();
                    today.setHours(today.getHours() - 5); // last 5 hours
                    
                    imap.search(['ALL', ['SINCE', today]], (err, results) => {
                        if (err || !results || results.length === 0) {
                            console.log('No messages.');
                            imap.end();
                            return resolve();
                        }

                        const f = imap.fetch(results, { bodies: '' });
                        let remaining = results.length;

                        f.on('message', (msg) => {
                            msg.on('body', (stream) => {
                                simpleParser(stream, (err, mail) => {
                                    console.log(`[MSG] From: ${mail.from.value[0].address}, Sub: ${mail.subject}, Date: ${mail.date.toISOString()}`);
                                    remaining--;
                                    if (remaining === 0) {
                                        imap.end();
                                    }
                                });
                            });
                        });
                        
                        f.once('error', resolve);
                        f.once('end', () => {});
                    });
                });
            });
            imap.once('error', resolve);
            imap.once('end', resolve);
            imap.connect();
        });
    }
}

peek();
