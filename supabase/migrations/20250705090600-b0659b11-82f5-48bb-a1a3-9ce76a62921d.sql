-- Create storage bucket for admission letters
INSERT INTO storage.buckets (id, name, public) VALUES ('admission-letters', 'admission-letters', false);

-- Create storage policies for admission letters
CREATE POLICY "Admins can upload admission letters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'admission-letters');

CREATE POLICY "Admins can view all admission letters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admission-letters');

CREATE POLICY "Agents can view their students' admission letters" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admission-letters');

-- Add admission_letter_url column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS admission_letter_url text;

-- Add admission_letter_uploaded_at column to track when it was uploaded
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS admission_letter_uploaded_at timestamp with time zone;