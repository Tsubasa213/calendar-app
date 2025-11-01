-- Test if policies are working correctly
-- Run this as the authenticated user to see if policies allow the operations

-- 1. Check your user ID
SELECT auth.uid() as my_user_id;

-- 2. Check calendars you own
SELECT id, name, owner_id 
FROM public.calendars 
WHERE owner_id = auth.uid();

-- 3. Check if you can see event_types policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'event_types' AND schemaname = 'public';

-- 4. Test INSERT permission (replace 'YOUR_CALENDAR_ID' with actual ID)
-- This is a test - it will fail if policies are not working
-- Comment out after testing
/*
INSERT INTO public.event_types (calendar_id, name, color)
VALUES ('YOUR_CALENDAR_ID', 'Test Type', '#FF0000')
RETURNING *;

-- If successful, clean up:
DELETE FROM public.event_types WHERE name = 'Test Type';
*/
