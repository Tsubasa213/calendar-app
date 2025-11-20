-- EMERGENCY FIX: Temporarily disable RLS to test if that's the issue
-- WARNING: This removes security temporarily. Use only for testing!

-- Disable RLS on events and event_types
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types DISABLE ROW LEVEL SECURITY;

-- Test if things work now
-- After confirming it works, we'll re-enable RLS with correct policies

-- To re-enable later (DON'T RUN THIS YET):
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
