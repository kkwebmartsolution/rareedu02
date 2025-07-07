-- Create student_visa table for tracking visa information
CREATE TABLE public.student_visa (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  visa_type VARCHAR(100) NOT NULL DEFAULT 'Student Visa',
  visa_number VARCHAR(100),
  issue_date DATE,
  expiration_date DATE,
  
  -- Visa Status checkboxes
  application_submitted BOOLEAN DEFAULT false,
  visa_interview BOOLEAN DEFAULT false,
  visa_approved BOOLEAN DEFAULT false,
  residency_registration BOOLEAN DEFAULT false,
  
  -- Residency information
  residency_deadline DATE,
  residency_address TEXT,
  local_id_number VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);

-- Create RLS policy
ALTER TABLE public.student_visa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on student_visa" 
ON public.student_visa 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_student_visa_updated_at
  BEFORE UPDATE ON public.student_visa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();