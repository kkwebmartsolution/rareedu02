-- Create student_credentials table
CREATE TABLE public.student_credentials (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.student_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for student credentials (only admins can access)
CREATE POLICY "Only admins can view student credentials" 
ON public.student_credentials 
FOR SELECT 
USING (true); -- Will need proper auth role checking when auth is implemented

CREATE POLICY "Only admins can insert student credentials" 
ON public.student_credentials 
FOR INSERT 
WITH CHECK (true); -- Will need proper auth role checking when auth is implemented

CREATE POLICY "Only admins can update student credentials" 
ON public.student_credentials 
FOR UPDATE 
USING (true); -- Will need proper auth role checking when auth is implemented

-- Function to generate unique username
CREATE OR REPLACE FUNCTION public.generate_student_username(student_id_param INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 1;
    student_record RECORD;
BEGIN
    -- Get student details
    SELECT first_name, last_name, admission_number INTO student_record
    FROM students 
    WHERE id = student_id_param;
    
    -- Create base username from first name + last name (first 3 chars each) + last 4 chars of admission number
    base_username := LOWER(
        SUBSTRING(student_record.first_name FROM 1 FOR 3) || 
        SUBSTRING(student_record.last_name FROM 1 FOR 3) ||
        COALESCE(RIGHT(student_record.admission_number, 4), LPAD(student_id_param::TEXT, 4, '0'))
    );
    
    -- Remove any non-alphanumeric characters
    base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '', 'g');
    
    final_username := base_username;
    
    -- Check if username exists and increment if needed
    WHILE EXISTS (SELECT 1 FROM student_credentials WHERE username = final_username) LOOP
        final_username := base_username || counter::TEXT;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_username;
END;
$$;

-- Function to generate random password
CREATE OR REPLACE FUNCTION public.generate_student_password()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    password TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 8 character password
    FOR i IN 1..8 LOOP
        password := password || SUBSTRING(chars FROM (FLOOR(RANDOM() * LENGTH(chars)) + 1)::INTEGER FOR 1);
    END LOOP;
    
    RETURN password;
END;
$$;

-- Function to create credentials for a student
CREATE OR REPLACE FUNCTION public.create_student_credentials(student_id_param INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    new_username TEXT;
    new_password TEXT;
BEGIN
    -- Generate username and password
    new_username := generate_student_username(student_id_param);
    new_password := generate_student_password();
    
    -- Insert credentials
    INSERT INTO student_credentials (student_id, username, password)
    VALUES (student_id_param, new_username, new_password);
END;
$$;

-- Generate credentials for all existing students
INSERT INTO student_credentials (student_id, username, password)
SELECT 
    s.id,
    generate_student_username(s.id),
    generate_student_password()
FROM students s
WHERE NOT EXISTS (
    SELECT 1 FROM student_credentials sc WHERE sc.student_id = s.id
);

-- Create trigger function to auto-generate credentials for new students
CREATE OR REPLACE FUNCTION public.auto_create_student_credentials()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create credentials for the new student
    PERFORM create_student_credentials(NEW.id);
    RETURN NEW;
END;
$$;

-- Create trigger to auto-generate credentials for new students
CREATE TRIGGER create_credentials_for_new_student
    AFTER INSERT ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_student_credentials();

-- Add trigger for updating timestamps
CREATE TRIGGER update_student_credentials_updated_at
    BEFORE UPDATE ON public.student_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();