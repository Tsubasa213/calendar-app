-- Debug: Check if events are visible to calendar members

-- 1. Your user ID
SELECT auth.uid() as my_user_id;

-- 2. Calendars you are a member of
SELECT 
  c.id as calendar_id,
  c.name as calendar_name,
  cm.role as my_role,
  c.owner_id
FROM public.calendars c
JOIN public.calendar_members cm ON cm.calendar_id = c.id
WHERE cm.user_id = auth.uid();

-- 3. All events in calendars you are a member of
SELECT 
  e.id,
  e.title,
  e.calendar_id,
  c.name as calendar_name,
  e.created_by,
  u.name as creator_name
FROM public.events e
JOIN public.calendars c ON c.id = e.calendar_id
LEFT JOIN public.users u ON u.id = e.created_by
WHERE e.calendar_id IN (
  SELECT calendar_id 
  FROM public.calendar_members 
  WHERE user_id = auth.uid()
)
ORDER BY e.start_time DESC
LIMIT 20;

-- 4. Check events RLS policy
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'events' AND schemaname = 'public';
