-- Create personal_expense_categories table
CREATE TABLE public.personal_expense_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personal_expenses table
CREATE TABLE public.personal_expenses (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.personal_expense_categories(id),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash',
  receipt_url TEXT,
  has_receipt BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_payment_mode CHECK (payment_mode IN ('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Cheque'))
);

-- Enable Row Level Security
ALTER TABLE public.personal_expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for personal_expense_categories (readable by all)
CREATE POLICY "Categories are viewable by all" 
ON public.personal_expense_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Categories can be managed by all" 
ON public.personal_expense_categories 
FOR ALL 
USING (true);

-- Create policies for personal_expenses (allow all operations for now since app handles auth)
CREATE POLICY "Allow all operations on personal expenses" 
ON public.personal_expenses 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personal_expense_categories_updated_at
BEFORE UPDATE ON public.personal_expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_expenses_updated_at
BEFORE UPDATE ON public.personal_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.personal_expense_categories (name, description) VALUES
('Travel', 'Travel expenses including flights, hotels, transportation'),
('Shopping', 'Personal shopping and retail purchases'),
('Bills', 'Utility bills, subscriptions, and recurring payments'),
('Investment', 'Investment and savings related expenses'),
('Food & Dining', 'Restaurant meals, food delivery, groceries'),
('Healthcare', 'Medical expenses, insurance, pharmacy'),
('Entertainment', 'Movies, events, recreation activities'),
('Education', 'Training, courses, books, educational materials'),
('Technology', 'Software, hardware, gadgets, tech subscriptions'),
('Miscellaneous', 'Other expenses that do not fit specific categories');