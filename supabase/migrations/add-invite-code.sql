-- Add invite_code column if it doesn't exist
ALTER TABLE public.calendars 
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_invite_code();

-- Create function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..16 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure invite_code is set
CREATE OR REPLACE FUNCTION ensure_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    -- Generate a unique invite code
    LOOP
      NEW.invite_code := generate_invite_code();
      -- Check if this code already exists
      IF NOT EXISTS (SELECT 1 FROM public.calendars WHERE invite_code = NEW.invite_code) THEN
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invite_code
DROP TRIGGER IF EXISTS trigger_ensure_invite_code ON public.calendars;
CREATE TRIGGER trigger_ensure_invite_code
  BEFORE INSERT OR UPDATE ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION ensure_invite_code();

-- Update existing calendars without invite_code
DO $$
DECLARE
  calendar_record RECORD;
  new_code TEXT;
BEGIN
  FOR calendar_record IN 
    SELECT id FROM public.calendars WHERE invite_code IS NULL OR invite_code = ''
  LOOP
    -- Generate unique code for each existing calendar
    LOOP
      new_code := generate_invite_code();
      IF NOT EXISTS (SELECT 1 FROM public.calendars WHERE invite_code = new_code) THEN
        UPDATE public.calendars SET invite_code = new_code WHERE id = calendar_record.id;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;
END $$;
