-- Fix RLS policy for character_issues table to work without Supabase Auth
-- Drop the current policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.character_issues;

-- Create a more permissive policy since the app handles auth at application level
CREATE POLICY "Allow all operations" 
ON public.character_issues 
FOR ALL 
USING (true) 
WITH CHECK (true);