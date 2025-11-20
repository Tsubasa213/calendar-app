-- Quick diagnostic to see what's wrong

-- 1. Check if policies exist
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('events', 'event_types') AND schemaname = 'public'
GROUP BY tablename;

-- 2. List all policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('events', 'event_types') AND schemaname = 'public'
ORDER BY tablename, cmd;

-- 3. Check your membership and role
SELECT 
  c.id,
  c.name,
  cm.role,
  c.owner_id,
  c.owner_id = auth.uid() as is_owner
FROM public.calendars c
JOIN public.calendar_members cm ON cm.calendar_id = c.id
WHERE cm.user_id = auth.uid();

-- 4. Try to manually test INSERT permission
-- Replace 'YOUR_CALENDAR_ID' with actual calendar ID from step 3
-- SELECT 
--   EXISTS (
--     SELECT 1 FROM public.calendar_members cm
--     WHERE cm.calendar_id = 'YOUR_CALENDAR_ID'
--     AND cm.user_id = auth.uid() 
--     AND cm.role IN ('owner', 'editor')
--   ) as can_insert_event;
