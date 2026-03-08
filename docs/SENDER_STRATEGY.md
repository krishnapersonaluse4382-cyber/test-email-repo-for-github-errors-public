# SENDER STRATEGY: Warmup, Jitter, and Scheduling

## 1. The Human Jitter Protocol (Variable Timing)
- **The Problem**: Fixed 2-minute (120s) intervals are easily detected by Google's spam filters.
- **The Absolute Rule**: Every send must have a **RANDOMIZED** delay.
- **The Range**: Between 180 seconds (3 mins) and 420 seconds (7 mins).
- **The Code Logic**: `Math.floor(Math.random() * (420 - 180 + 1) + 180) * 1000`.
- **Status**: Code in `production_sender.js` currently violates this (using fixed 120s). **MUST BE UPDATED.**

## 2. Daily Warmup & Scaling
- **Account Age**: All accounts (Krishna, Rik, Ryan) are in "Early Warmup."
- **Daily Cap**: 
    - Week 1: Max 10 emails per day per account.
    - Week 2: Max 20 emails per day per account.
- **The Sharding Rule**: Never send more than 5 emails from the same account in a single "Batch" run.

## 3. The 9th March Activation (Verification Test)
- **Goal**: Send 12 emails to `krishnapersonaluse438@gmail.com`.
- **Accounts**: Krishna (4), Ryan (4), Rik (4).
- **Execution Windows (Local Time)**:
    - **BATCH 1 (2:04 AM)**: Process 4 leads. (Rotation: K-R-R-K).
    - **BATCH 2 (5:49 AM)**: Process 4 leads. (Rotation: R-R-K-R).
    - **BATCH 3 (11:00 AM)**: Process 4 leads. (Rotation: R-K-R-R).
- **Requirement**: GitHub Action CRON must be adjusted for UTC (Local - 5:30).

## 4. Failure Recovery
- If a batch fails (Internet/Power), the next timed batch will **Auto-Resume** by fetching the next `READY` leads.
- No lead will be retried if status is `SENDING_NOW` or `SENT`.
