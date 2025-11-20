-- Comprehensive debugging for calendar sharing issues

-- 1. Check your user ID
SELECT auth.uid() as my_user_id, auth.email() as my_email;

-- 2. Check all calendars and your membership
SELECT 
  c.id as calendar_id,
  c.name as calendar_name,
  c.owner_id,
  cm.user_id as member_user_id,
  cm.role as my_role,
  CASE 
    WHEN c.owner_id = auth.uid() THEN '✓ You are the owner'
    ELSE '- You are a member'
  END as ownership_status
FROM public.calendars c
LEFT JOIN public.calendar_members cm ON cm.calendar_id = c.id AND cm.user_id = auth.uid()
WHERE cm.user_id = auth.uid() OR c.owner_id = auth.uid()
ORDER BY c.created_at DESC;

-- 3. Check event_types for your calendars
SELECT 
  et.id,
  et.name as event_type_name,
  et.color,
  et.calendar_id,
  c.name as calendar_name,
  c.owner_id,
  CASE 
    WHEN c.owner_id = auth.uid() THEN '✓ You own this calendar'
    ELSE '- Member of this calendar'
  END as status
FROM public.event_types et
JOIN public.calendars c ON c.id = et.calendar_id
WHERE et.calendar_id IN (
  SELECT cm.calendar_id 
  FROM public.calendar_members cm 
  WHERE cm.user_id = auth.uid()
)
ORDER BY et.calendar_id, et.created_at;

-- 4. Check events in your calendars
SELECT 
  e.id,
  e.title,
  e.calendar_id,
  c.name as calendar_name,
  e.created_by,
  u.name as creator_name,
  CASE 
    WHEN e.created_by = auth.uid() THEN '✓ You created this'
    ELSE '- Created by ' || u.name
  END as creation_status
FROM public.events e
JOIN public.calendars c ON c.id = e.calendar_id
LEFT JOIN public.users u ON u.id = e.created_by
WHERE e.calendar_id IN (
  SELECT cm.calendar_id 
  FROM public.calendar_members cm 
  WHERE cm.user_id = auth.uid()
)
ORDER BY e.start_time DESC
LIMIT 20;

-- 5. Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('events', 'event_types', 'calendar_members', 'calendars')
ORDER BY tablename, cmd;
