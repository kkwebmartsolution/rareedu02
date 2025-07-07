-- Remove the trigger that's causing issues
DROP TRIGGER IF EXISTS auto_create_student_credentials ON public.students;

-- We'll handle credential creation in the application code instead