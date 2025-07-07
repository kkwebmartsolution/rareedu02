
-- Add missing fields to apply_students table to match the comprehensive student form
ALTER TABLE apply_students 
ADD COLUMN IF NOT EXISTS parents_phone_number TEXT,
ADD COLUMN IF NOT EXISTS tenth_passing_year TEXT,
ADD COLUMN IF NOT EXISTS twelfth_passing_year TEXT,
ADD COLUMN IF NOT EXISTS neet_passing_year TEXT,
ADD COLUMN IF NOT EXISTS tenth_marksheet_number TEXT,
ADD COLUMN IF NOT EXISTS pcb_average NUMERIC,
ADD COLUMN IF NOT EXISTS neet_roll_number TEXT,
ADD COLUMN IF NOT EXISTS qualification_status TEXT CHECK (qualification_status IN ('qualified', 'not_qualified')),
ADD COLUMN IF NOT EXISTS neet_score_card_url TEXT,
ADD COLUMN IF NOT EXISTS tenth_marksheet_url TEXT,
ADD COLUMN IF NOT EXISTS affidavit_paper_url TEXT,
ADD COLUMN IF NOT EXISTS agent_id INTEGER REFERENCES agents(id);
