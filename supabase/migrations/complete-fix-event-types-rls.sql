-- Complete fix for event_types RLS policies
-- This will completely reset and recreate all policies

-- Step 1: Disable RLS temporarily
ALTER TABLE public.event_types DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'event_types'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.event_types', r.policyname);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new policies

-- SELECT: Users can view event types for calendars they are members of
CREATE POLICY "event_types_select_policy" ON public.event_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = event_types.calendar_id
      AND cm.user_id = auth.uid()
    )
  );

-- INSERT: Calendar owners can insert event types
CREATE POLICY "event_types_insert_policy" ON public.event_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );

-- UPDATE: Calendar owners can update event types
CREATE POLICY "event_types_update_policy" ON public.event_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );

-- DELETE: Calendar owners can delete event types
CREATE POLICY "event_types_delete_policy" ON public.event_types
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );

-- Verify the policies were created
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Users can view'
    WHEN cmd = 'INSERT' THEN 'Owners can insert'
    WHEN cmd = 'UPDATE' THEN 'Owners can update'
    WHEN cmd = 'DELETE' THEN 'Owners can delete'
  END as description
FROM pg_policies 
WHERE tablename = 'event_types' AND schemaname = 'public'
ORDER BY cmd;
