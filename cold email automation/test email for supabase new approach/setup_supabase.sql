-- This SQL script sets up the "Cloud Lock" table in your Supabase project.
-- Copy and paste this into the SQL Editor (bottom left) of your Supabase dashboard.

CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    campaign_id text NOT NULL,
    status text NOT NULL, -- 'SENDING_NOW' or 'SENT'
    sender_email TEXT,
    started_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    CONSTRAINT email_logs_pkey PRIMARY KEY (id),
    CONSTRAINT unique_email_campaign UNIQUE (email, campaign_id)
);

-- Row Level Security (RLS) - This makes it secure
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow your app to read and write freely (since you use the Anon key)
CREATE POLICY "Enable all for anyone" ON public.email_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);
