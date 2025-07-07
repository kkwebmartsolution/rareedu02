-- Add missing columns to students table to match the comprehensive form data
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parents_phone_number text,
ADD COLUMN IF NOT EXISTS tenth_passing_year text,
ADD COLUMN IF NOT EXISTS twelfth_passing_year text,
ADD COLUMN IF NOT EXISTS neet_passing_year text,
ADD COLUMN IF NOT EXISTS tenth_marksheet_number text,
ADD COLUMN IF NOT EXISTS pcb_average numeric,
ADD COLUMN IF NOT EXISTS neet_roll_number text,
ADD COLUMN IF NOT EXISTS qualification_status text,
ADD COLUMN IF NOT EXISTS neet_score_card_url text,
ADD COLUMN IF NOT EXISTS tenth_marksheet_url text,
ADD COLUMN IF NOT EXISTS affidavit_paper_url text;