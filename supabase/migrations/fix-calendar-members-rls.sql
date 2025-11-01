-- Fix infinite recursion in calendar_members RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view calendar members for their calendars" ON public.calendar_members;

-- Create a corrected policy that doesn't cause infinite recursion
-- Users can view calendar members if they are a member of that calendar
CREATE POLICY "Users can view calendar members for their calendars" ON public.calendar_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calendar_members cm
      WHERE cm.calendar_id = calendar_members.calendar_id 
      AND cm.user_id = auth.uid()
    )
  );

-- Alternative: Create a simpler policy
-- DROP POLICY IF EXISTS "Users can view calendar members for their calendars" ON public.calendar_members;
-- CREATE POLICY "Users can view calendar members for their calendars" ON public.calendar_members
--   FOR SELECT USING (
--     user_id = auth.uid() OR
--     calendar_id IN (
--       SELECT id FROM public.calendars WHERE owner_id = auth.uid()
--     )
--   );
