-- Add policy to allow users to join calendars via invite code
-- Users should be able to insert themselves as members

CREATE POLICY "Users can join calendars" ON public.calendar_members
  FOR INSERT WITH CHECK (
    -- ユーザーは自分自身をメンバーとして追加できる
    auth.uid() = user_id
  );
