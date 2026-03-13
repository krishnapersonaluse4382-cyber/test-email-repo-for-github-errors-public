const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const accounts = [
    { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
];

async function peek() {
    const acc = accounts[0];
    console.log(`--- Explicit Peek for ${acc.user} ---`);
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
            if (err) throw err;
            
            // Just fetch the last 10 messages, regardless of date
            imap.search(['ALL'], (err, results) => {
                if (err || !results || results.length === 0) {
                    console.log('No messages.');
                    imap.end();
                    return;
                }

                const last10 = results.slice(-10);
                const f = imap.fetch(last10, { bodies: '' });
                let processed = 0;

                f.on('message', (msg) => {
                    msg.on('body', (stream) => {
                        simpleParser(stream, (err, mail) => {
                            console.log(`[FOUND] ${mail.date.toISOString()} | From: ${mail.from.value[0].address} | Sub: ${mail.subject}`);
                            processed++;
                            if (processed === last10.length) imap.end();
                        });
                    });
                });
            });
        });
    });
    imap.connect();
}

peek();
