# DOCUMENTATION HUB: Project Evolution & Lessons Learned (V1.0)

## 1. The Local vs Cloud Decision
- **Previous System**: We used local folders on the PC to store Excel leads. 
- **The Failure**: If the PC lid was closed, there was no way for another machine to know which emails had been sent. Duplicate emails were a high risk.
- **The Solution (Current)**: **Supabase**. It is our "Cloud Memory." Every machine checks Supabase *before* sending. This is our absolute core standard.

## 2. The Login Stability (The 16-Digit Password)
- **The Success**: We discovered that using your main Gmail password was causing constant `EAUTH` and `Login Timeout` errors.
- **The Absolute Rule**: We **only** use the 16-digit "App Password" generated in Google's Security settings for all accounts (Krishna, Rik, Ryan).
- **The Port Discovery**: We found that Port 465 with `secure: true` is more stable than Port 587 with `STARTTLS`.

## 3. The "Zombies" Problem
- **The Scenario**: If a process crashes while sending, a lead gets stuck at `SENDING_NOW`.
- **The Rule**: Our code **must** only grab leads where `status = READY`. If it is `SENDING_NOW`, it is ignored. This ensures a crash never results in a double-send.

## 4. Why GitHub?
- **The Goal**: "Send emails while PC is off."
- **The Proof**: GitHub provides the **Hands** (The CPU/RAM) and Supabase provides the **Memory**. Together, they form a "Headless" system.
