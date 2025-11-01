-- Create default calendar for existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  new_calendar_id UUID;
BEGIN
  -- Loop through all users who don't have a default calendar
  FOR user_record IN 
    SELECT u.id, u.email, u.name
    FROM public.users u
    WHERE NOT EXISTS (
      SELECT 1 
      FROM public.calendars c 
      WHERE c.owner_id = u.id AND c.is_default = true
    )
  LOOP
    -- Create default calendar for this user
    INSERT INTO public.calendars (name, description, color, owner_id, is_public, is_default)
    VALUES (
      'マイカレンダー',
      'あなた専用のカレンダーです',
      '#3B82F6',
      user_record.id,
      false,
      true
    )
    RETURNING id INTO new_calendar_id;

    -- Add user as owner in calendar_members (only if not exists)
    INSERT INTO public.calendar_members (calendar_id, user_id, role)
    VALUES (new_calendar_id, user_record.id, 'owner')
    ON CONFLICT (calendar_id, user_id) DO NOTHING;

    RAISE NOTICE 'Created default calendar for user: %', user_record.email;
  END LOOP;
END $$;
