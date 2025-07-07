-- Add payment_status column to agents table
ALTER TABLE public.agents 
ADD COLUMN payment_status character varying DEFAULT 'Unpaid'::character varying;