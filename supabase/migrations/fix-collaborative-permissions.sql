-- COMPLETE FIX: Allow all calendar members to collaborate fully
-- This fixes the issues where only owners could manage event types and events

-- ===== STEP 1: Drop all existing policies =====

-- Events policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'events'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.events', r.policyname);
    END LOOP;
    
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'event_types'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.event_types', r.policyname);
    END LOOP;
END $$;

-- ===== STEP 2: Ensure RLS is enabled =====
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- ===== STEP 3: Create collaborative policies =====

-- ========== EVENT_TYPES POLICIES (All members can manage) ==========

-- SELECT: All calendar members can view event types
CREATE POLICY "event_types_select" ON public.event_types
  FOR SELECT USING (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: All calendar members can create event types
CREATE POLICY "event_types_insert" ON public.event_types
  FOR INSERT WITH CHECK (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: All calendar members can update event types
CREATE POLICY "event_types_update" ON public.event_types
  FOR UPDATE USING (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: All calendar members can delete event types
CREATE POLICY "event_types_delete" ON public.event_types
  FOR DELETE USING (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- ========== EVENTS POLICIES (All members can manage) ==========

-- SELECT: All calendar members can view events
CREATE POLICY "events_select" ON public.events
  FOR SELECT USING (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: All calendar members can create events
CREATE POLICY "events_insert" ON public.events
  FOR INSERT WITH CHECK (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: All calendar members can update events
CREATE POLICY "events_update" ON public.events
  FOR UPDATE USING (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: All calendar members can delete events
CREATE POLICY "events_delete" ON public.events
  FOR DELETE USING (
    calendar_id IN (
      SELECT calendar_id 
      FROM public.calendar_members 
      WHERE user_id = auth.uid()
    )
  );

-- ===== STEP 4: Verify policies were created =====
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN tablename = 'events' AND cmd = 'SELECT' THEN '✓ All members can view events'
    WHEN tablename = 'events' AND cmd = 'INSERT' THEN '✓ All members can create events'
    WHEN tablename = 'events' AND cmd = 'UPDATE' THEN '✓ All members can update events'
    WHEN tablename = 'events' AND cmd = 'DELETE' THEN '✓ All members can delete events'
    WHEN tablename = 'event_types' AND cmd = 'SELECT' THEN '✓ All members can view event types'
    WHEN tablename = 'event_types' AND cmd = 'INSERT' THEN '✓ All members can create event types'
    WHEN tablename = 'event_types' AND cmd = 'UPDATE' THEN '✓ All members can update event types'
    WHEN tablename = 'event_types' AND cmd = 'DELETE' THEN '✓ All members can delete event types'
  END as description
FROM pg_policies 
WHERE tablename IN ('events', 'event_types') AND schemaname = 'public'
ORDER BY tablename, cmd;

-- ===== STEP 5: Verify member permissions =====
-- This shows your calendars and your role
SELECT 
  c.id,
  c.name as calendar_name,
  cm.role,
  c.owner_id = auth.uid() as is_owner
FROM public.calendars c
JOIN public.calendar_members cm ON cm.calendar_id = c.id
WHERE cm.user_id = auth.uid()
ORDER BY c.created_at DESC;
