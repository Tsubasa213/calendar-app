-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_calendar_id UUID;
BEGIN
  -- 1. ユーザープロフィールを作成
  INSERT INTO public.users (id, email, name, timezone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'Asia/Tokyo')
  );

  -- 2. デフォルトカレンダーを作成
  INSERT INTO public.calendars (name, description, color, owner_id, is_public, is_default)
  VALUES (
    'マイカレンダー',
    'あなた専用のカレンダーです',
    '#3B82F6',
    NEW.id,
    false,
    true
  )
  RETURNING id INTO new_calendar_id;

  -- 3. カレンダーメンバーに追加（オーナーとして）
  INSERT INTO public.calendar_members (calendar_id, user_id, role)
  VALUES (new_calendar_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
