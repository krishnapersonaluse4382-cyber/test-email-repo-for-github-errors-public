# MASTER DOCUMENT: Technical Map & Data Lineage (V1.0)

## 1. The Core Repository
- **Root Path**: `c:\Users\praja\.gemini\antigravity\My projects\Workspace - 2`
- **Lead Path**: `C:/Users/praja/Downloads/leads.xlsx`

## 2. File-by-File Technical Deep-Dive

### A. The Ingestion Engine (`ingest_leads.js`)
- **Location**: `/cold email automation/test email for supabase new approach/ingest_leads.js`
- **The Input**: Uses `xlsx` library to parse the `leads.xlsx` file from the Windows Downloads folder.
- **The Logic**: It loops through the JSON rows. It validates that the `email` column is not empty.
- **The Linkage**: It connects to **Supabase** via the JS Client. It uses an `upsert` (Update or Insert) command so we never have duplicate leads based on email addresses.

### B. The Conductor (`production_sender.js`)
- **Location**: `/cold email automation/test email for supabase new approach/production_sender.js`
- **The Automation**: This is the file GitHub Actions calls.
- **The Step-by-Step Selection**:
  1. Queries Supabase: `SELECT * FROM email_logs WHERE status = 'READY' LIMIT 1`.
  2. If a lead is found, it immediately triggers `UPDATE status = 'SENDING_NOW'`. This is the **Cloud Lock**.
  3. It reads the `senderIndex` to choose between Krishna, Ryan, or Rik.
- **The Rotation**: It uses a local `senderIndex.txt` or a Supabase `config` table to remember who sent last.

### C. The Muscle (`sender_engine.js`)
- **Location**: `/cold email automation/test email for supabase new approach/sender_engine.js`
- **The Connection**: Hardcoded SMTP settings for Gmail (`smtp.gmail.com`, Port 465, Secure: true).
- **The Discovery**: We discovered that "service: gmail" is unstable. **Manual SMTP is the only way.**
- **The Authentication**: Uses `process.env.EMAIL_PASS`. This MUST be the 16-digit App Password, NOT the main account password.

### D. The Messenger (`reporter.js`)
- **Location**: `/cold email automation/test email for supabase new approach/reporter.js`
- **The Logic**: Runs after the `production_sender.js` batch completes.
- **The Summary**: Calculates `Successful Sends` vs `Errors` found in the `email_logs` table for the last 24 hours.
- **The Linkage**: Sends a JSON POST request to the **Vercel Webhook URL**.

## 3. The Cloud "Hands" (`production_sender.yml`)
- **Location**: `/.github/workflows/production_sender.yml`
- **The Trigger**: A GitHub Cron job. 
- **The Secrets**: GitHub injects the passwords from its "Action Secrets" storage into the Node environment. This is why the code works when the laptop is closed.
