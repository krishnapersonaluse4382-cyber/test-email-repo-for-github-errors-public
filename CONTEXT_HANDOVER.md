# PROJECT CONTEXT HANDOVER: Cold Email Automation System

## 1. THE OBJECTIVE
Build a headless, automated cold email system that runs while the PC is OFF. 
- **Rotation**: Krishna -> Ryan -> Rik.
- **Human Jitter**: 180s to 420s random delay.
- **Reporting**: Updates Supabase and (eventually) a Vercel Dashboard.

## 2. THE CURRENT ARCHITECTURE (The "Pipeline")
- **Database (Cloud Memory)**: Supabase. Table `email_logs` stores all lead states.
- **Logic (The Brain)**: `production_sender.js`. It handles the rotation and timing.
- **Muscle (The CPU)**: GitHub Actions (`production_sender.yml`). It wakes up every 10 mins to run the script.
- **The Trigger**: `schedule_requested_test.js`. Injected 3 test emails for 2:30am, 5:46am, and 11:02am.

## 3. WHY THE LAST TEST FAILED (CRITICAL)
The system is logically sound but environmentally disconnected.
1. The code runs on **GitHub Cloud** when the PC is off.
2. The **App Passwords** for your Gmail accounts are in your local `.env` file.
3. GitHub cannot see your local files. It needs those passwords in **GitHub Secrets**.
4. Since the Secrets were missing, GitHub woke up at 01:37 AM, tried to log in, failed, and crashed. No email was sent.

## 4. THE FILE MAP (For the next AI/The User)
- **Logic Entry Point**: `cold email automation/test email for supabase new approach/production_sender.js`
- **GitHub Config**: `.github/workflows/production_sender.yml`
- **Lead Ingestion**: `cold email automation/test email for supabase new approach/ingest_leads.js`
- **System Docs**: `docs/MASTER_SYSTEM_BLUEPRINT.md` and `docs/TECHNICAL_MAP.md`

## 5. USER PREFERENCE (IMPORTANT)
The user has successfully sent emails directly from **Supabase** before and prefers a simpler architecture. The current "GitHub Connection" is perceived as a point of failure and unnecessary complexity. 

## 6. NEXT STEPS / FIXES
1. **Option A (Fix GitHub)**: Add `EMAIL_PASS`, `SUPABASE_URL`, etc., to GitHub Settings > Secrets.
2. **Option B (The Supabase Way)**: Stop using GitHub for the "Muscle." Relocate the `production_sender.js` logic into **Supabase Edge Functions** so the database sends the emails directly.

---
**END OF HANDOVER**
