-- RUN THESE IN THE SUPABASE SQL EDITOR TO UPGRADE TO THE PRODUCTION QUEUE SYSTEM

-- 1. Add missing columns to email_logs for queue-based sending
ALTER TABLE public.email_logs ADD COLUMN IF NOT EXISTS sender_account TEXT;
ALTER TABLE public.email_logs ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.email_logs ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.email_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Create the replies table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.email_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id UUID REFERENCES public.email_logs(id), -- Links to the original send
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    message_id TEXT UNIQUE, -- Prevents duplicate reply logging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS for replies (just in case)
ALTER TABLE public.email_replies ENABLE ROW LEVEL SECURITY;

-- 4. Allow access to replies
CREATE POLICY "Enable all for anyone replies" ON public.email_replies
    FOR ALL
    USING (true)
    WITH CHECK (true);
