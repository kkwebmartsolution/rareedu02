-- Create staff_salaries table for salary management
CREATE TABLE public.staff_salaries (
  id SERIAL PRIMARY KEY,
  staff_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  basic_salary NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  allowances NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  deductions NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  gross_salary NUMERIC(10,2) GENERATED ALWAYS AS (basic_salary + allowances) STORED,
  net_salary NUMERIC(10,2) GENERATED ALWAYS AS (basic_salary + allowances - deductions) STORED,
  salary_month DATE NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_date DATE,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'processing', 'cancelled')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('bank_transfer', 'cash', 'cheque', 'upi')),
  UNIQUE(staff_id, salary_month)
);

-- Create staff_salary_structures table for predefined salary structures
CREATE TABLE public.staff_salary_structures (
  id SERIAL PRIMARY KEY,
  staff_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  position VARCHAR(100) NOT NULL,
  basic_salary NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  allowances NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_salary_structures ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_salaries (accessible to authenticated users)
CREATE POLICY "Enable read access for all authenticated users" ON public.staff_salaries
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.staff_salaries
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.staff_salaries
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.staff_salaries
FOR DELETE USING (true);

-- Create policies for staff_salary_structures
CREATE POLICY "Enable read access for all authenticated users" ON public.staff_salary_structures
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.staff_salary_structures
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.staff_salary_structures
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.staff_salary_structures
FOR DELETE USING (true);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_staff_salaries_updated_at
  BEFORE UPDATE ON public.staff_salaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_salary_structures_updated_at
  BEFORE UPDATE ON public.staff_salary_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_staff_salaries_staff_id ON public.staff_salaries(staff_id);
CREATE INDEX idx_staff_salaries_salary_month ON public.staff_salaries(salary_month);
CREATE INDEX idx_staff_salaries_payment_status ON public.staff_salaries(payment_status);
CREATE INDEX idx_staff_salary_structures_staff_id ON public.staff_salary_structures(staff_id);
CREATE INDEX idx_staff_salary_structures_active ON public.staff_salary_structures(is_active);