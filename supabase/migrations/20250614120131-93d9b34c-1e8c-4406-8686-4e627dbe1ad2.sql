-- Drop the trigger first
DROP TRIGGER IF EXISTS move_approved_application_trigger ON apply_students;

-- Check if there are any RLS policies blocking updates
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'apply_students';