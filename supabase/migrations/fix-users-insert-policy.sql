-- Add INSERT policy for users table to allow trigger to work
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Alternative: Allow authenticated users to insert their own profile
-- This is safer and allows the trigger to work properly
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
