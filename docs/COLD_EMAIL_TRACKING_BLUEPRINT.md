# 🎯 Cold Email Tracking Blueprint: The "Final Verified" Setup

This document outlines the exact, battle-tested configuration for your cold email tracking system. These settings were finalized after multiple rounds of testing to solve the "Google Proxy/Bot Open" issue and the "Vercel Execution Timeout" issue.

## 1. Tracking Server (Vercel: `api/track.js`)
This is the heart of the system. It handles the 1x1 pixel and logs the data to Supabase.

### 🛠️ Key Logic:
1.  **Persistence**: We must `await` the Supabase POST *before* sending the pixel response. If we don't, Vercel kills the process and the data never hits the DB.
2.  **Bot Filter**: We block generic bots but **allow** `GoogleImageProxy` so Gmail opens can be seen.

```javascript
// Exact Regex for Bot Detection (Relaxed for Gmail Proxy)
const isBot = /bot|crawler|spider|headless|inspect|preview|whatsapp|bing|slurp|duckduckgo/i.test(userAgent);

// Exact Supabase POST sequence (AWAIT IS REQUIRED)
if (id && !isBot) {
    await fetch(`${SUPABASE_URL}/rest/v1/email_opens`, {
        method: 'POST',
        headers: { ...config },
        body: JSON.stringify({ email_id: id, opened_at: new Date() })
    });
}
res.send(PIXEL);
```

---

## 2. Sender Logic (The "Stealth HTML" Method)
To track opens in plain-text-style emails, we use a hidden link that tricks the browser/email client.

### 🛠️ The "Perfect" Pixel HTML:
```html
<p>Your plain text message here.</p>
<!-- The Invisible Handshake -->
<img src="https://your-app.vercel.app/api/track?id=UNIQUE_ID" 
     width="1" height="1" 
     style="display:none !important;" />
```

---

### 7. The Verification Timing Rule (The "45-Second" Rule)
When testing your setup, strictly follow this protocol to avoid confusing results:
*   **The Guard Window**: The server ignores everything for the first 30 seconds.
*   **The Wait**: After sending a test, **Wait 45 Seconds** before opening the email yourself.
*   **The Reason**: If you open it too fast (e.g., at 15 seconds), the server will treat *you* as a bot and throw the data away. To see your open on the dashboard, you must wait until the guard window has expired.

### 8. System Flexibility (Trigger Source)
The system is designed to be "Environment Agnostic." You can trigger the sending pipeline from:
*   **Local Machine**: Using `node script.js`.
*   **GitHub Actions**: As a cron job for automated daily sends.
*   **Vercel/Edge Functions**: For purely cloud-based operations.
*   **Note**: As long as the environment has access to the Supabase API Key and SMTP credentials, the tracking will work exactly the same way.

### 9. Dashboard Behavior
*   **Live Data, Manual Refresh**: The dashboard updates live in the database, but the Vercel UI currently requires a browser refresh to pull the latest aggregated stats from Supabase.

## 3. Database "Handshake" (Supabase)
For the dashboard to show an email exists, it must be logged in the `email_sent` table *from the sender script*.

### 🛠️ The Sync Object:
```javascript
{
    email_id: "UNIQUE_ID",
    recipient: "email@address.com",
    category: "CAMPAIGN_NAME", // This creates the dashboard folder
    sent_at: new Date().toISOString()
}
```

---

## 🧪 Verification Standard (The Trust Test)
To verify it is working in the future:
1.  **Send to yourself**: Sent volume should increase by 1.
2.  **DO NOT OPEN**: Wait 5 minutes. The rate should stay at 0%.
3.  **OPEN**: Rate should change to 100% within 5 seconds.

*If it hits 100% before you open it, the bot filter needs tightening.*
*If it stays at 0% after you open it, the `await` sequence or Supabase URL is broken.*
