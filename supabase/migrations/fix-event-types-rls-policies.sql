-- Fix event_types RLS policies
-- Drop existing policies and recreate them

DROP POLICY IF EXISTS "Users can view event types for their calendars" ON public.event_types;
DROP POLICY IF EXISTS "Calendar owners can insert event types" ON public.event_types;
DROP POLICY IF EXISTS "Calendar owners can update event types" ON public.event_types;
DROP POLICY IF EXISTS "Calendar owners can delete event types" ON public.event_types;

-- Enable RLS on event_types table
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Users can view event types for calendars they are members of
CREATE POLICY "Users can view event types for their calendars" ON public.event_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = event_types.calendar_id
      AND cm.user_id = auth.uid()
    )
  );

-- Calendar owners and editors can insert event types
CREATE POLICY "Calendar members can insert event types" ON public.event_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      INNER JOIN public.calendars c ON c.id = cm.calendar_id
      WHERE cm.calendar_id = event_types.calendar_id
      AND cm.user_id = auth.uid()
      AND (c.owner_id = auth.uid() OR cm.role IN ('owner', 'editor'))
    )
  );

-- Calendar owners and editors can update event types
CREATE POLICY "Calendar members can update event types" ON public.event_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      INNER JOIN public.calendars c ON c.id = cm.calendar_id
      WHERE cm.calendar_id = event_types.calendar_id
      AND cm.user_id = auth.uid()
      AND (c.owner_id = auth.uid() OR cm.role IN ('owner', 'editor'))
    )
  );

-- Calendar owners can delete event types
CREATE POLICY "Calendar owners can delete event types" ON public.event_types
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.calendars c
      WHERE c.id = event_types.calendar_id
      AND c.owner_id = auth.uid()
    )
  );
