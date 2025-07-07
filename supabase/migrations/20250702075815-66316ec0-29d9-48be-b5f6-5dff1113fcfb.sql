
-- Create agent_notifications table
CREATE TABLE public.agent_notifications (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES public.users(id),
  message TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_id INTEGER,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.agent_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view their own notifications
CREATE POLICY "Agents can view their own notifications" 
  ON public.agent_notifications 
  FOR SELECT 
  USING (agent_id = (
    SELECT user_id FROM user_sessions 
    WHERE token = current_setting('app.session_token', true) 
    AND expires_at > now() 
    LIMIT 1
  ));

-- Policy for admins to insert notifications
CREATE POLICY "Admins can insert notifications" 
  ON public.agent_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Policy for agents to update their own notifications (mark as read)
CREATE POLICY "Agents can update their own notifications" 
  ON public.agent_notifications 
  FOR UPDATE 
  USING (agent_id = (
    SELECT user_id FROM user_sessions 
    WHERE token = current_setting('app.session_token', true) 
    AND expires_at > now() 
    LIMIT 1
  ));

-- Add stage columns to apply_students table
ALTER TABLE public.apply_students 
ADD COLUMN IF NOT EXISTS admission_letter_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tanlx_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS col_letter_generated BOOLEAN DEFAULT FALSE;
