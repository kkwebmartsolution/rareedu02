-- Add agent_id column to students table to track which agent added the student
ALTER TABLE public.students 
ADD COLUMN agent_id integer REFERENCES public.agents(id);

-- Create index for better performance on agent_id lookups
CREATE INDEX idx_students_agent_id ON public.students(agent_id);