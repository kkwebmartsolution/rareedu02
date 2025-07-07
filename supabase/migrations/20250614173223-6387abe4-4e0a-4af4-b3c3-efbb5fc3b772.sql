-- Create sequence for character_issues first
CREATE SEQUENCE IF NOT EXISTS character_issues_id_seq;

-- Create character_issues table to track student disciplinary issues
CREATE TABLE public.character_issues (
  id INTEGER NOT NULL DEFAULT nextval('character_issues_id_seq'::regclass) PRIMARY KEY,
  student_id INTEGER NOT NULL,
  complaint TEXT NOT NULL,
  fine_amount NUMERIC NOT NULL DEFAULT 0,
  fine_collected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.character_issues ENABLE ROW LEVEL SECURITY;

-- Create policies for character_issues
CREATE POLICY "Allow all operations for authenticated users" 
ON public.character_issues 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_character_issues_updated_at
  BEFORE UPDATE ON public.character_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically remove resolved character issues
CREATE OR REPLACE FUNCTION public.resolve_character_issue(issue_id INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.character_issues 
  SET fine_collected = true, 
      resolved_at = now(),
      updated_at = now()
  WHERE id = issue_id;
  
  -- Optionally delete the record after marking as resolved
  -- DELETE FROM public.character_issues WHERE id = issue_id;
END;
$$;