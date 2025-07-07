-- Add university_id column to hostels table
ALTER TABLE public.hostels 
ADD COLUMN university_id INTEGER REFERENCES public.universities(id);

-- Add index for better performance
CREATE INDEX idx_hostels_university_id ON public.hostels(university_id);