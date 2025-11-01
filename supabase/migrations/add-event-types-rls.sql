-- Add RLS policies for event_types table

-- Enable RLS on event_types table
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- Users can view event types for calendars they are members of
CREATE POLICY "Users can view event types for their calendars" ON public.event_types
  FOR SELECT USING (
    calendar_id IN (
      SELECT c.id FROM public.calendars c
      INNER JOIN public.calendar_members cm ON c.id = cm.calendar_id
      WHERE cm.user_id = auth.uid()
    )
  );

-- Users can insert event types in calendars they own
CREATE POLICY "Calendar owners can insert event types" ON public.event_types
  FOR INSERT WITH CHECK (
    calendar_id IN (
      SELECT id FROM public.calendars WHERE owner_id = auth.uid()
    )
  );

-- Users can update event types in calendars they own
CREATE POLICY "Calendar owners can update event types" ON public.event_types
  FOR UPDATE USING (
    calendar_id IN (
      SELECT id FROM public.calendars WHERE owner_id = auth.uid()
    )
  );

-- Users can delete event types in calendars they own
CREATE POLICY "Calendar owners can delete event types" ON public.event_types
  FOR DELETE USING (
    calendar_id IN (
      SELECT id FROM public.calendars WHERE owner_id = auth.uid()
    )
  );
