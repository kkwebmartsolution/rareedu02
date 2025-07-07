-- Fix the student credentials creation function to use correct column name
CREATE OR REPLACE FUNCTION public.create_student_credentials()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_username text;
  new_password text;
BEGIN
  -- Generate username
  new_username := generate_username(NEW.first_name, NEW.last_name, NEW.id);
  
  -- Generate random password
  new_password := generate_random_password(10);
  
  -- Insert credentials (using 'password' column, not 'password_hash')
  INSERT INTO student_credentials (student_id, username, password)
  VALUES (NEW.id, new_username, new_password);
  
  -- Log the generated credentials (in production, this should be sent via email)
  RAISE NOTICE 'Student credentials created - Username: %, Password: %', new_username, new_password;
  
  RETURN NEW;
END;
$function$;