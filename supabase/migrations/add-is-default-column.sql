-- Add is_default column to calendars table
ALTER TABLE public.calendars 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add constraint to ensure only one default calendar per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_default_calendar_per_user 
ON public.calendars (owner_id) 
WHERE is_default = true;
