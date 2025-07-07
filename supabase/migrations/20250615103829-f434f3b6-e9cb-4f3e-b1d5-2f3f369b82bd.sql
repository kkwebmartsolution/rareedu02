-- Create table for student-specific fee customizations
CREATE TABLE public.student_fee_customizations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  fee_structure_component_id INTEGER NOT NULL,
  custom_amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_student_fee_component UNIQUE(student_id, fee_structure_component_id)
);

-- Add RLS policies (if authentication is implemented later)
ALTER TABLE public.student_fee_customizations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (update this when authentication is implemented)
CREATE POLICY "Allow all operations on student_fee_customizations" 
ON public.student_fee_customizations 
FOR ALL 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_student_fee_customizations_updated_at
  BEFORE UPDATE ON public.student_fee_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update fee payments with custom amounts
CREATE OR REPLACE FUNCTION public.apply_student_fee_customizations(p_student_id INTEGER, p_fee_structure_component_id INTEGER, p_custom_amount DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the fee_payments table with the custom amount
  UPDATE public.fee_payments
  SET amount_due = p_custom_amount,
      updated_at = NOW()
  WHERE student_id = p_student_id 
    AND fee_structure_component_id = p_fee_structure_component_id;
    
  -- Insert or update the customization record
  INSERT INTO public.student_fee_customizations (student_id, fee_structure_component_id, custom_amount)
  VALUES (p_student_id, p_fee_structure_component_id, p_custom_amount)
  ON CONFLICT (student_id, fee_structure_component_id)
  DO UPDATE SET 
    custom_amount = p_custom_amount,
    updated_at = NOW();
END;
$$;