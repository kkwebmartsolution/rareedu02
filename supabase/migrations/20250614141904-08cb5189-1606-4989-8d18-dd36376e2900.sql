-- Identify if a trigger exists and drop it
DO $$
BEGIN
  -- Check if the trigger exists and drop it if it does
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_create_student_credentials') THEN
    DROP TRIGGER IF EXISTS auto_create_student_credentials ON public.students;
  END IF;
END
$$;

-- Update the create_student_credentials function to handle duplicates
CREATE OR REPLACE FUNCTION public.create_student_credentials()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_username text;
  new_password text;
  existing_count integer;
BEGIN
  -- Check if credentials already exist for this student
  SELECT COUNT(*) INTO existing_count FROM student_credentials WHERE student_id = NEW.id;
  
  -- Only create credentials if none exist
  IF existing_count = 0 THEN
    -- Generate username
    new_username := generate_username(NEW.first_name, NEW.last_name, NEW.id);
    
    -- Generate random password
    new_password := generate_random_password(10);
    
    -- Insert credentials (using 'password' column, not 'password_hash')
    INSERT INTO student_credentials (student_id, username, password)
    VALUES (NEW.id, new_username, new_password);
    
    -- Log the generated credentials
    RAISE NOTICE 'Student credentials created - Username: %, Password: %', new_username, new_password;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Re-create the trigger
CREATE TRIGGER auto_create_student_credentials
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_student_credentials();