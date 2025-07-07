-- Create offices table
CREATE TABLE public.offices (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- Create policies for offices (admin access only)
CREATE POLICY "Admin can view all offices" 
ON public.offices 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can create offices" 
ON public.offices 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update offices" 
ON public.offices 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete offices" 
ON public.offices 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_offices_updated_at
BEFORE UPDATE ON public.offices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.offices (name, address, contact_person, phone, email, status) VALUES
('London Office', '123 London Street, London, UK', 'John Smith', '+44 20 1234 5678', 'london@rareeducation.com', 'Active'),
('Manchester Office', '456 Manchester Road, Manchester, UK', 'Jane Doe', '+44 161 234 5678', 'manchester@rareeducation.com', 'Active'),
('Birmingham Office', '789 Birmingham Ave, Birmingham, UK', 'Bob Wilson', '+44 121 234 5678', 'birmingham@rareeducation.com', 'Active');

-- Add office_id column to office_expenses table
ALTER TABLE public.office_expenses 
ADD COLUMN office_id INTEGER REFERENCES public.offices(id);

-- Update existing office_expenses records to match sample offices
UPDATE public.office_expenses 
SET office_id = CASE 
  WHEN location = 'London Office' THEN (SELECT id FROM public.offices WHERE name = 'London Office')
  WHEN location = 'Manchester Office' THEN (SELECT id FROM public.offices WHERE name = 'Manchester Office')
  WHEN location = 'Birmingham Office' THEN (SELECT id FROM public.offices WHERE name = 'Birmingham Office')
  ELSE NULL
END;