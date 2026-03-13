# HEADLESS EMAIL AUTOMATION — COMPLETE CONTEXT
# For Future AI Sessions: Read This First. Every Word.

---

## WHAT THIS SYSTEM DOES
Sends cold emails automatically from Supabase cloud servers.
PC can be OFF. GitHub is not involved. Antigravity is not involved.
Once leads are loaded into the database, the system runs forever on its own.

---

## FINAL WORKING ARCHITECTURE

```
[ONE TIME ON PC]
Run inject script → loads leads into Supabase DB with scheduled_at timestamps
↓
[CLOUD — RUNS 24/7 WITHOUT PC]

cron-job.org (fires every 1 minute)
    ↓ HTTP POST with Authorization header
Supabase Edge Function "quick-function"
    ↓ reads email_logs table
    ↓ finds rows WHERE status='READY' AND scheduled_at <= NOW()
    ↓ sets status='SENDING_NOW' (cloud lock — prevents double send)
    ↓ sends email via Gmail SMTP (port 465, SSL)
    ↓ sets status='SENT', records sent_at and sender_email
Gmail/SMTP → recipient inbox
```

---

## SUPABASE PROJECT DETAILS

- **Project URL:** https://zukjamcmpsjjarhjftpy.supabase.co
- **Project Ref:** zukjamcmpsjjarhjftpy
- **Edge Function Name:** `quick-function` (NOT headless-sender — that gives 404)
- **Edge Function Endpoint:** `https://zukjamcmpsjjarhjftpy.supabase.co/functions/v1/quick-function`
- **Database Table:** `email_logs`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zukjamcmpsjjarhjftpy

---

## DATABASE SCHEMA (email_logs table)

```sql
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  campaign_id TEXT,
  status TEXT DEFAULT 'READY',  -- READY | SENDING_NOW | SENT | FAILED
  sender_email TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Status flow:** READY → SENDING_NOW → SENT

---

## EDGE FUNCTION CODE (quick-function)
**Location in Supabase:** Edge Functions → quick-function → Code tab

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.7";

serve(async (_req) => {
  try {
    const emailUser = Deno.env.get("EMAIL_USER")?.trim();
    const emailPass = Deno.env.get("EMAIL_PASS")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!emailUser || !emailPass || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({
        error: "One or more secrets are missing",
        EMAIL_USER: emailUser ? `SET (${emailUser})` : "MISSING",
        EMAIL_PASS: emailPass ? "SET" : "MISSING",
        SUPABASE_URL: supabaseUrl ? "SET" : "MISSING",
        SUPABASE_SERVICE_ROLE_KEY: serviceKey ? "SET" : "MISSING",
      }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();
    const { data: leads, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("status", "READY")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(1);

    if (error) throw new Error("DB error: " + error.message);
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ message: "No leads ready to send right now" }), { status: 200 });
    }

    const lead = leads[0];

    await supabase
      .from("email_logs")
      .update({ status: "SENDING_NOW" })
      .eq("id", lead.id)
      .eq("status", "READY");

    const senders = [
      { user: Deno.env.get("EMAIL_USER")!.trim(), pass: Deno.env.get("EMAIL_PASS")!.trim() },
      { user: Deno.env.get("RYAN_USER")!.trim(),  pass: Deno.env.get("RYAN_PASS")!.trim() },
      { user: Deno.env.get("RIK_USER")!.trim(),   pass: Deno.env.get("RIK_PASS")!.trim() },
    ];
    const sender = senders[Math.floor(Math.random() * senders.length)];

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: sender.user, pass: sender.pass },
    });

    await transporter.sendMail({
      from: `"Cold Email Automation" <${sender.user}>`,
      to: lead.email,
      subject: "Headless Verification: Success",
      text: "This email was sent from Supabase Cloud while your PC was OFF. No GitHub. No PC needed.",
    });

    await supabase
      .from("email_logs")
      .update({ status: "SENT", sent_at: new Date().toISOString(), sender_email: sender.user })
      .eq("id", lead.id);

    return new Response(
      JSON.stringify({ message: "Email sent successfully!", to: lead.email, from: sender.user }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
```

**CRITICAL NOTES ABOUT THIS CODE:**
- `npm:nodemailer@6.9.7` — the `npm:` prefix is MANDATORY. Without it, you get "Buffer is not defined"
- Do NOT use `deno.land/x/smtp` — gives "Deno.writeAll is not a function"
- Do NOT use regular `nodemailer` import (no npm: prefix) — gives "Buffer is not defined"
- Port 465 + secure: true — do NOT use 587/TLS for Gmail

---

## SUPABASE SECRETS (Edge Functions → Secrets)

All these must be set in Supabase → Edge Functions → Secrets:

| Secret Name | Value |
|---|---|
| EMAIL_USER | krishna@contentelevators.org |
| EMAIL_PASS | 16-digit Gmail App Password for krishna |
| RYAN_USER | ryan@contentelevators.org |
| RYAN_PASS | 16-digit Gmail App Password for ryan |
| RIK_USER | rik@contentelevators.org |
| RIK_PASS | 16-digit Gmail App Password for rik |
| SUPABASE_SERVICE_ROLE_KEY | from Supabase Settings → API → service_role key |

**Note:** SUPABASE_URL and SUPABASE_ANON_KEY are injected automatically. But SUPABASE_SERVICE_ROLE_KEY must be set manually.

---

## CRON-JOB.ORG SETUP

- **Account:** log in at https://cron-job.org
- **Job Name:** "supabase email pc off send"
- **COMMON tab settings:**
  - URL: `https://zukjamcmpsjjarhjftpy.supabase.co/functions/v1/quick-function`
  - Schedule: Every 1 minute
  - Enable job: ON
  - Save responses in job history: ON (important for debugging)
- **ADVANCED tab settings:**
  - Requires HTTP authentication: OFF
  - Header Key: `Authorization`
  - Header Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1a2phbWNtcHNqamFyaGpmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTM0ODksImV4cCI6MjA4ODQ2OTQ4OX0.ONRp3OKSyg_2HaEAFhcFIFHZmhNrMvX4bEOM4HrCm4Q`
  - Request method: POST
  - Request body: (empty)

**ANON KEY (full):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1a2phbWNtcHNqamFyaGpmdHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTM0ODksImV4cCI6MjA4ODQ2OTQ4OX0.ONRp3OKSyg_2HaEAFhcFIFHZmhNrMvX4bEOM4HrCm4Q
```

---

## HOW TO INJECT LEADS (Run on PC before closing)

### Single lead:
```js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// IST = UTC + 5:30 | To convert: subtract 5h30m from IST to get UTC
// Example: 9:30 AM IST = 4:00 AM UTC = '2026-03-10T04:00:00Z'
supabase.from('email_logs').insert({
  email: 'recipient@gmail.com',
  campaign_id: 'MY_CAMPAIGN',
  status: 'READY',
  scheduled_at: '2026-03-10T04:00:00Z'  // UTC time
}).then(({ error }) => {
  if (error) console.error(error.message);
  else console.log('Lead injected successfully');
});
```

### Multiple leads from Excel:
```js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Read Excel file
const wb = xlsx.readFile(path.join('C:\\path\\to\\your\\file.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws);

// Map to leads — adjust column names to match your Excel headers
const leads = data
  .filter(row => row.Emails)  // skip empty rows
  .map((row, i) => ({
    email: row.Emails,
    campaign_id: 'MY_CAMPAIGN',
    status: 'READY',
    scheduled_at: new Date(Date.now() + (i * 2 * 60 * 1000)).toISOString() // 2-min gaps
  }));

supabase.from('email_logs')
  .insert(leads)
  .then(({ error }) => {
    if (error) console.error(error.message);
    else {
      console.log(`Injected ${leads.length} leads:`);
      leads.forEach(l => console.log(' -', l.email, '->', new Date(l.scheduled_at).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})));
    }
  });
```

### Excel file column format expected:
| Name | Emails |
|---|---|
| Krishna | prajapatirvk6@gmail.com |
| Ryan | ryan@contentelevators.org |

---

## HOW VARIABLE TIMING WORKS

The cron fires every 1 minute. It ONLY sends email when:
1. A row has `status = 'READY'`
2. AND `scheduled_at <= NOW()`

So if you load leads with: 9:07, 9:53, 11:32, 2:14 as scheduled_at times,
emails go out at exactly those times (within ~1 minute).
Recipients see no pattern. Looks like a human sending manually.

**Time conversion cheat sheet (IST → UTC):**
- 8:00 AM IST = 2:30 AM UTC
- 9:00 AM IST = 3:30 AM UTC
- 10:00 AM IST = 4:30 AM UTC
- 12:00 PM IST = 6:30 AM UTC
- 2:00 PM IST = 8:30 AM UTC
 
Formula: UTC = IST - 5h30m

---

## WHAT WAS TRIED AND FAILED (Do NOT attempt these again)

| Approach | Why it failed |
|---|---|
| GitHub Actions | Requires PC to push commits or manual trigger |
| pg_cron + net.http_post | Ran silently but HTTP call to Edge Function failed with no error |
| deno.land/x/smtp@v0.7.0 | "Deno.writeAll is not a function" — deprecated API |
| nodemailer without npm: prefix | "Buffer is not defined" — Node.js API unavailable in Deno |
| denomailer | "The specified from address is not a valid email address" — env vars not reading |

---

## LOCAL .env FILE LOCATION
```
c:\Users\praja\.gemini\antigravity\My projects\Workspace - 2\cold email automation\test email for supabase new approach\.env
```

Contents needed:
```
SUPABASE_URL=https://zukjamcmpsjjarhjftpy.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key)
EMAIL_USER=krishna@contentelevators.org
EMAIL_PASS=xxxx xxxx xxxx xxxx
RYAN_USER=ryan@contentelevators.org
RYAN_PASS=xxxx xxxx xxxx xxxx
RIK_USER=rik@contentelevators.org
RIK_PASS=xxxx xxxx xxxx xxxx
```

---

## DEBUGGING CHECKLIST

If emails are not sending:
1. Check cron-job.org → Job History → what HTTP status is it getting?
   - 404 = wrong function URL (use quick-function, not headless-sender)
   - 401 = wrong Authorization header (check the Bearer token)
   - 200 with "No leads ready" = no READY leads in DB (inject new ones)
   - 500 = check Supabase Edge Function logs
2. Check Supabase → Edge Functions → quick-function → Invocations tab
   - Are new invocations appearing? If no, cron-job.org is not calling the function
3. Check Supabase → SQL Editor:
   ```sql
   SELECT id, email, status, scheduled_at, sent_at FROM email_logs ORDER BY created_at DESC LIMIT 10;
   ```
   - Are leads stuck in SENDING_NOW? Reset them:
   ```sql
   UPDATE email_logs SET status='READY' WHERE status='SENDING_NOW';
   ```

---

## KNOWN LIMITATIONS TO FIX IN FUTURE

1. **Sender is randomly selected** — currently picks from all 3 Gmail accounts randomly.
   To fix: add `sender_account` column to email_logs and have Edge Function read it.

2. **Email subject/body is hardcoded** — add `subject` and `body` columns to allow per-lead customization.

3. **One email per cron run** — Edge Function processes 1 lead per execution to avoid timeouts.
   Fine for current volume. Scale by increasing limit() in the query if needed.
