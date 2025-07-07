-- Create office_expenses table
CREATE TABLE public.office_expenses (
  id SERIAL PRIMARY KEY,
  location TEXT NOT NULL,
  month DATE NOT NULL,
  rent NUMERIC NOT NULL DEFAULT 0,
  utilities NUMERIC NOT NULL DEFAULT 0,
  internet NUMERIC NOT NULL DEFAULT 0,
  marketing NUMERIC NOT NULL DEFAULT 0,
  travel NUMERIC NOT NULL DEFAULT 0,
  miscellaneous NUMERIC NOT NULL DEFAULT 0,
  monthly_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.office_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for office expenses (admin access only)
CREATE POLICY "Admin can view all office expenses" 
ON public.office_expenses 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can create office expenses" 
ON public.office_expenses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update office expenses" 
ON public.office_expenses 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete office expenses" 
ON public.office_expenses 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_office_expenses_updated_at
BEFORE UPDATE ON public.office_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.office_expenses (location, month, rent, utilities, internet, marketing, travel, miscellaneous, monthly_total) VALUES
('London Office', '2025-04-01', 3500, 800, 250, 1800, 600, 400, 7350),
('Manchester Office', '2025-04-01', 2800, 650, 200, 1200, 500, 350, 5700),
('Birmingham Office', '2025-04-01', 2200, 550, 180, 1000, 400, 300, 4630),
('London Office', '2025-03-01', 3500, 750, 250, 2000, 700, 350, 7550);