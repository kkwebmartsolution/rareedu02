-- Create todo_tasks table for calendar-based tasks
CREATE TABLE public.todo_tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  assigned_to BIGINT REFERENCES public.users(id),
  created_by BIGINT NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Enable Row Level Security
ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for todo_tasks
CREATE POLICY "Allow all operations on todo tasks" 
ON public.todo_tasks 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_todo_tasks_updated_at
BEFORE UPDATE ON public.todo_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_todo_tasks_due_date ON public.todo_tasks(due_date);
CREATE INDEX idx_todo_tasks_status ON public.todo_tasks(status);
CREATE INDEX idx_todo_tasks_assigned_to ON public.todo_tasks(assigned_to);
CREATE INDEX idx_todo_tasks_created_by ON public.todo_tasks(created_by);

-- Insert sample tasks
INSERT INTO public.todo_tasks (title, description, due_date, priority, status, created_by) VALUES
('Review student applications', 'Review and process pending student applications', CURRENT_DATE + INTERVAL '2 days', 'high', 'pending', 1),
('Update agent commissions', 'Calculate and update commission payments for agents', CURRENT_DATE + INTERVAL '5 days', 'medium', 'pending', 1),
('Prepare monthly report', 'Compile financial and operational data for monthly report', CURRENT_DATE + INTERVAL '7 days', 'high', 'pending', 1),
('Check hostel capacity', 'Review hostel occupancy and plan for next intake', CURRENT_DATE + INTERVAL '3 days', 'medium', 'pending', 1);