-- Add foreign key constraint between character_issues and students
ALTER TABLE public.character_issues 
ADD CONSTRAINT fk_character_issues_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;