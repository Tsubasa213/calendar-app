-- Add icon column to calendars table
ALTER TABLE public.calendars ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT '📅';

-- Create a function to check calendar creation limit (max 2 per user)
CREATE OR REPLACE FUNCTION check_calendar_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
  calendar_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO calendar_count
  FROM public.calendars
  WHERE owner_id = NEW.owner_id;
  
  IF calendar_count >= 2 THEN
    RAISE EXCEPTION 'User can create a maximum of 2 calendars';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calendar creation limit
DROP TRIGGER IF EXISTS trigger_check_calendar_creation_limit ON public.calendars;
CREATE TRIGGER trigger_check_calendar_creation_limit
  BEFORE INSERT ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION check_calendar_creation_limit();

-- Create a function to check calendar member limit (max 8 per calendar)
CREATE OR REPLACE FUNCTION check_calendar_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM public.calendar_members
  WHERE calendar_id = NEW.calendar_id;
  
  IF member_count >= 8 THEN
    RAISE EXCEPTION 'Calendar can have a maximum of 8 members';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calendar member limit
DROP TRIGGER IF EXISTS trigger_check_calendar_member_limit ON public.calendar_members;
CREATE TRIGGER trigger_check_calendar_member_limit
  BEFORE INSERT ON public.calendar_members
  FOR EACH ROW
  EXECUTE FUNCTION check_calendar_member_limit();

-- Create a function to check user participation limit (max 3 calendars)
CREATE OR REPLACE FUNCTION check_user_participation_limit()
RETURNS TRIGGER AS $$
DECLARE
  participation_count INTEGER;
BEGIN
  -- Count calendars where user is a member (excluding owned calendars)
  SELECT COUNT(*) INTO participation_count
  FROM public.calendar_members cm
  JOIN public.calendars c ON cm.calendar_id = c.id
  WHERE cm.user_id = NEW.user_id AND c.owner_id != NEW.user_id;
  
  IF participation_count >= 3 THEN
    RAISE EXCEPTION 'User can participate in a maximum of 3 shared calendars (excluding owned calendars)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user participation limit
DROP TRIGGER IF EXISTS trigger_check_user_participation_limit ON public.calendar_members;
CREATE TRIGGER trigger_check_user_participation_limit
  BEFORE INSERT ON public.calendar_members
  FOR EACH ROW
  EXECUTE FUNCTION check_user_participation_limit();

-- Update the invite_code generation to use UUID format
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 16));
END;
$$ LANGUAGE plpgsql;

-- Add function to automatically generate invite code if not provided
CREATE OR REPLACE FUNCTION ensure_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invite codes
DROP TRIGGER IF EXISTS trigger_ensure_invite_code ON public.calendars;
CREATE TRIGGER trigger_ensure_invite_code
  BEFORE INSERT ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION ensure_invite_code();

-- Add policy to allow viewing calendar by invite code
CREATE POLICY "Anyone can view calendar by invite code" ON public.calendars
  FOR SELECT USING (invite_code IS NOT NULL);
