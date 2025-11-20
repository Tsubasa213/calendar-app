-- COMPLETE FIX: Reset all RLS policies for calendar sharing

-- ===== STEP 1: Drop all existing policies =====

-- Events policies
DROP POLICY IF EXISTS "Users can view events from their calendars" ON public.events;
DROP POLICY IF EXISTS "Users can insert events in calendars they have editor access" ON public.events;
DROP POLICY IF EXISTS "Users can update events they created or in calendars they have editor access" ON public.events;
DROP POLICY IF EXISTS "Users can delete events they created or in calendars they own" ON public.events;
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;

-- Event types policies
DROP POLICY IF EXISTS "Users can view event types for their calendars" ON public.event_types;
DROP POLICY IF EXISTS "Calendar owners can insert event types" ON public.event_types;
DROP POLICY IF EXISTS "Calendar owners can update event types" ON public.event_types;
DROP POLICY IF EXISTS "Calendar owners can delete event types" ON public.event_types;
DROP POLICY IF EXISTS "Calendar members can insert event types" ON public.event_types;
DROP POLICY IF EXISTS "Calendar members can update event types" ON public.event_types;
DROP POLICY IF EXISTS "event_types_select_policy" ON public.event_types;
DROP POLICY IF EXISTS "event_types_insert_policy" ON public.event_types;
DROP POLICY IF EXISTS "event_types_update_policy" ON public.event_types;
DROP POLICY IF EXISTS "event_types_delete_policy" ON public.event_types;

-- ===== STEP 2: Ensure RLS is enabled =====
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- ===== STEP 3: Create new comprehensive policies =====

-- ========== EVENTS POLICIES ==========

-- SELECT: All calendar members can view events
CREATE POLICY "events_select_policy" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = events.calendar_id
      AND cm.user_id = auth.uid()
    )
  );

-- INSERT: Calendar owners and editors can create events
CREATE POLICY "events_insert_policy" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = events.calendar_id
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'editor')
    )
  );

-- UPDATE: Event creators OR calendar owners/editors can update
CREATE POLICY "events_update_policy" ON public.events
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = events.calendar_id
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'editor')
    )
  );

-- DELETE: Event creators OR calendar owners can delete
CREATE POLICY "events_delete_policy" ON public.events
  FOR DELETE USING (
    created_by = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = events.calendar_id
      AND cm.user_id = auth.uid() 
      AND cm.role = 'owner'
    )
  );

-- ========== EVENT_TYPES POLICIES ==========

-- SELECT: All calendar members can view event types
CREATE POLICY "event_types_select_policy" ON public.event_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = event_types.calendar_id
      AND cm.user_id = auth.uid()
    )
  );

-- INSERT: Only calendar owners can create event types
CREATE POLICY "event_types_insert_policy" ON public.event_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );

-- UPDATE: Only calendar owners can update event types
CREATE POLICY "event_types_update_policy" ON public.event_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );

-- DELETE: Only calendar owners can delete event types
CREATE POLICY "event_types_delete_policy" ON public.event_types
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );

-- ===== STEP 4: Verify all policies =====
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN tablename = 'events' AND cmd = 'SELECT' THEN '✓ All members can view events'
    WHEN tablename = 'events' AND cmd = 'INSERT' THEN '✓ Owners/Editors can create events'
    WHEN tablename = 'events' AND cmd = 'UPDATE' THEN '✓ Creators/Owners/Editors can update events'
    WHEN tablename = 'events' AND cmd = 'DELETE' THEN '✓ Creators/Owners can delete events'
    WHEN tablename = 'event_types' AND cmd = 'SELECT' THEN '✓ All members can view event types'
    WHEN tablename = 'event_types' AND cmd = 'INSERT' THEN '✓ Only owners can create event types'
    WHEN tablename = 'event_types' AND cmd = 'UPDATE' THEN '✓ Only owners can update event types'
    WHEN tablename = 'event_types' AND cmd = 'DELETE' THEN '✓ Only owners can delete event types'
  END as description
FROM pg_policies 
WHERE tablename IN ('events', 'event_types') AND schemaname = 'public'
ORDER BY tablename, cmd;
