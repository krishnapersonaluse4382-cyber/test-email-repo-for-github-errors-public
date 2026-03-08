# MASTER SYSTEM BLUEPRINT: Cold Email Automation (V1.0)

## 1. The Local File System (Workspace - 2)
These are the files on your actual computer that we have built or are building.

| File Path | Purpose | Technical Logic |
| :--- | :--- | :--- |
| `leads.xlsx` (in Downloads) | **The Fuel** | Your raw Excel sheet with Name, Email, and Company. |
| `ingest_leads.js` | **The Loader** | Reads Excel → Validates Email → Pushes to Supabase. |
| `sender_engine.js` | **The Muscle** | Connects to Gmail SMTP (Manual settings) → Sends the actual email. |
| `production_sender.js` | **The Conductor** | Loops through Supabase → Decides which account (Rik/Ryan/Krishna) goes next. |
| `reporter.js` [NEXT] | **The Messenger** | Grabs stats from Supabase → Pushes them to Vercel via API. |
| `.env` | **The Vault** | Stores your Supabase keys and Gmail App Passwords (Local only). |
| `package.json` | **The Toolbox** | Tells Node.js to install `nodemailer`, `@supabase/supabase-js`, and `xlsx`. |
| `SYSTEM_CORE_RULES.md` | **The DNA** | The master instructions for Antigravity to never forget the "Sharding" rules. |

---

## 2. The Cloud Infrastructure (Key Hubs)
Where the "Magic" happens while your laptop is closed.

- **GitHub Repository (test-email-repo-for-github-errors-public):**
    - **File:** `.github/workflows/production_sender.yml` (The Alarm Clock).
    - **Role:** Every 10-20 mins, it wakes up a virtual computer (Ubuntu) to run your code.
    - **Secrets:** You must add `SUPABASE_KEY`, `EMAIL_PASS`, etc., in GitHub Settings > Secrets.
- **Supabase (The Database):**
    - **Table:** `email_logs` (Stores Name, Email, Status, Sender Account, Timestamp).
    - **Table:** `subject_stats` [NEXT] (Stores Subject Line, Opens, Clicks).
- **Vercel (The Reporting Hub):**
    - **URL:** Your custom dashboard (e.g., `my-campaign-report.vercel.app`).
    - **API:** An "Endpoint" (a digital door) where GitHub drops off the report data.

---

## 3. The Credentials & API Keys
You need exactly these keys for the system to "Talk."
1. **Supabase URL**: Found in Supabase API settings.
2. **Supabase Anon Key**: Found in Supabase API settings.
3. **Gmail App Passwords (x3)**: 16-character codes generated in Google "Security" settings for Krishna, Ryan, and Rik.
4. **Vercel Deployment Key**: To allow GitHub to update your dashboard.

---

## 4. The Complete Step-by-Step Flow (The Absolute Path)
1. **PREPARE:** You update `leads.xlsx` on your laptop.
2. **INGEST:** You run `node ingest_leads.js`. The leads move from your Excel to Supabase.
3. **WAKE:** GitHub wakes up automatically based on the `.yml` file.
4. **SELECT:** `production_sender.js` asks Supabase: "Who is READY?"
5. **LOCK:** Supabase marks that person as `SENDING_NOW` (This is the "Cloud Lock"—it prevents double-sending).
6. **SEND:** `sender_engine.js` picks a "Sender Profile" (e.g., Rik), logs in, and fires the email with your personalized copy.
7. **TRACK:** If the email is opened, a Vercel Tracking Pixel (an invisible image) pings Vercel. Vercel then tells Supabase: "Lead opened! Update counter."
8. **REPORT:** Once GitHub finishes the batch, `reporter.js` sums up the day (e.g., "3 Sent, 1 Opened").
9. **DELIVER:** `reporter.js` makes a web-call to your Vercel Dashboard.
10. **ANALYZE:** You open Chrome, go to your Vercel URL, and see the campaign report.

---

## 5. The "Logic Hooks" (The Advanced Safety)
- **Rotation Logic**: Inside `production_sender.js`, there is an array: `['KRISHNA', 'RYAN', 'RIK']`. Every time a lead is processed, it moves to the next name.
- **Open Rate Guard [MISSING]**: A small script inside Vercel check the math. If `Open Count / Sent Count < 0.20`, it triggers a Slack Notification to your phone.
- **Auto-Kill [MISSING]**: If a subject line fails 3 times, Vercel updates the `subject_stats` table in Supabase to `active = false`. GitHub will then automatically skip that subject line.
