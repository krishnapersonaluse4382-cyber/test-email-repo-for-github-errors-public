# Cold Email System: Master Specification (V1.0)

## 1. System Architecture
- **Infrastructure**: GitHub Actions (Runner: ubuntu-latest)
- **Database**: Supabase (PostgreSQL)
- **SMTP**: Gmail Workspace (Manual SMTP Config: host: smtp.gmail.com, port: 465)
- **Reporter**: Vercel Dashboard API

## 2. File Manifest & Logic
| Filename | Directory | Context / Logic |
| :--- | :--- | :--- |
| `production_sender.js` | ROOT | Entry point for GitHub. Manages the batch loop and rotation. |
| `sender_engine.js` | ROOT | Core logic for SMTP connection and Supabase Lock updates. |
| `ingest_leads.js` | ROOT | Local script used to move data from Excel to Cloud. |
| `reporter.js` | ROOT | Function that aggregates results and pushes to Vercel API. |
| `package.json` | ROOT | Required dependencies: `@supabase/supabase-js`, `nodemailer`, `dotenv`, `xlsx`, `axios`. |
| `.github/workflows/production_sender.yml` | `.github/workflows/` | The cron-job schedule (*/15 * * * *). |

## 3. The State Machine (Lead Status)
1. **READY**: Default state. Script only selects leads with this status.
2. **SENDING_NOW**: Applied the millisecond the script selects the lead. Prevents duplicate runs.
3. **SENT**: Applied upon successful SMTP callback.
4. **FAILED**: Applied if SMTP returns error (invalid email, server timeout).
5. **STALLED** (Virtual): Assigned by `reporter.js` if a lead stays `SENDING_NOW` for > 60 mins.

## 4. Multi-Sender Protocol
- **Rotation**: Sequential Array [0, 1, 2] corresponding to Krishna, Ryan, Rik.
- **Fail-Safe**: If sender #1 fails, the script captures the error and moves to lead #2 using sender #2. It does NOT stop the whole batch.

## 5. Reporting Pipeline
- **Webhook**: POST request sent from GitHub to `VERCEL_REPORT_URL`.
- **Payload**: `{ campaign_id, timestamp, stats: { sent, failed, stalled }, alerts: [] }`.
- **Trigger**: Script end (batch completion).
