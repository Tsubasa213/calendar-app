-- Verify events RLS policies are correctly applied

-- 1. Check current events policies
SELECT 
  policyname,
  cmd,
  permissive,
  CASE 
    WHEN cmd = 'SELECT' THEN '✓ SELECT policy exists'
    WHEN cmd = 'INSERT' THEN '✓ INSERT policy exists'
    WHEN cmd = 'UPDATE' THEN '✓ UPDATE policy exists'
    WHEN cmd = 'DELETE' THEN '✓ DELETE policy exists'
  END as status
FROM pg_policies 
WHERE tablename = 'events' AND schemaname = 'public'
ORDER BY cmd;

-- 2. Check if RLS is enabled on events table
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✓ RLS is enabled'
    ELSE '✗ RLS is NOT enabled'
  END as status
FROM pg_tables 
WHERE tablename = 'events' AND schemaname = 'public';

-- 3. Test: Can you see events in shared calendars?
-- This query bypasses RLS to see all data
SELECT 
  e.id,
  e.title,
  e.calendar_id,
  c.name as calendar_name,
  cm.user_id as member_user_id,
  u.name as member_name,
  cm.role as member_role
FROM public.events e
JOIN public.calendars c ON c.id = e.calendar_id
JOIN public.calendar_members cm ON cm.calendar_id = c.id
LEFT JOIN public.users u ON u.id = cm.user_id
LIMIT 10;
