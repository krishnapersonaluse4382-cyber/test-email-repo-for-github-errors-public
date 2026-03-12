-- 1. Upgrade for Advanced Tracking (adding DNA Metadata)
ALTER TABLE public.email_sent ADD COLUMN IF NOT EXISTS structure_type TEXT;
ALTER TABLE public.email_sent ADD COLUMN IF NOT EXISTS persuasion_rule TEXT;
ALTER TABLE public.email_sent ADD COLUMN IF NOT EXISTS tone_setting TEXT;

-- 2. Create the Lead Ingestion Table
CREATE TABLE IF NOT EXISTS public.leads_to_email (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    company_name TEXT,
    job_title TEXT,
    industry TEXT,
    lead_source TEXT,
    personalized_hook TEXT, -- Where the AI stored its pre-written hook
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, SENT, FAILED
    assigned_agent TEXT, -- Krishna, Ryan, Rik
    campaign_name TEXT,
    dna_structure TEXT, -- The "A, B, C" combo we choose
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_status_update TIMESTAMP WITH TIME ZONE
);

-- 3. Enable RLS for Security
ALTER TABLE public.leads_to_email ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous access (assuming use of anon key for testing)
CREATE POLICY "Public full access" ON public.leads_to_email FOR ALL USING (true) WITH CHECK (true);

-- 5. Index for faster ingestion
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads_to_email(status);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads_to_email(assigned_agent);
