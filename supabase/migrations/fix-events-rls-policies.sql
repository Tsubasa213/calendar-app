-- Complete fix for events RLS policies
-- This ensures calendar members can see all events in their shared calendars

-- Step 1: Drop all existing events policies
DROP POLICY IF EXISTS "Users can view events from their calendars" ON public.events;
DROP POLICY IF EXISTS "Users can insert events in calendars they have editor access" ON public.events;
DROP POLICY IF EXISTS "Users can update events they created or in calendars they have editor access" ON public.events;
DROP POLICY IF EXISTS "Users can delete events they created or in calendars they own" ON public.events;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies with correct logic

-- SELECT: Users can view ALL events in calendars they are members of
CREATE POLICY "events_select_policy" ON public.events
  FOR SELECT USING (
    calendar_id IN (
      SELECT cm.calendar_id 
      FROM public.calendar_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- INSERT: Users with owner or editor role can insert events
CREATE POLICY "events_insert_policy" ON public.events
  FOR INSERT WITH CHECK (
    calendar_id IN (
      SELECT cm.calendar_id 
      FROM public.calendar_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'editor')
    )
  );

-- UPDATE: Users can update their own events OR events in calendars where they have owner/editor role
CREATE POLICY "events_update_policy" ON public.events
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR 
    calendar_id IN (
      SELECT cm.calendar_id 
      FROM public.calendar_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'editor')
    )
  );

-- DELETE: Users can delete their own events OR events in calendars where they are owner
CREATE POLICY "events_delete_policy" ON public.events
  FOR DELETE USING (
    created_by = auth.uid() 
    OR 
    calendar_id IN (
      SELECT cm.calendar_id 
      FROM public.calendar_members cm
      WHERE cm.user_id = auth.uid() 
      AND cm.role = 'owner'
    )
  );

-- Step 4: Verify policies were created successfully
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '✓ Members can view all events'
    WHEN cmd = 'INSERT' THEN '✓ Owners/Editors can create events'
    WHEN cmd = 'UPDATE' THEN '✓ Creators and Owners/Editors can update'
    WHEN cmd = 'DELETE' THEN '✓ Creators and Owners can delete'
  END as description
FROM pg_policies 
WHERE tablename = 'events' AND schemaname = 'public'
ORDER BY cmd;
