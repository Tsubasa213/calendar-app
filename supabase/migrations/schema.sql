-- Create tables for Time Tree like calendar app

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Calendars table
CREATE TABLE public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  invite_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Calendar members table
CREATE TABLE public.calendar_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES public.calendars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(calendar_id, user_id)
);

-- 4. Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES public.calendars(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  color VARCHAR(7),
  recurrence_rule TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Event reminders table
CREATE TABLE public.event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  remind_before_minutes INTEGER NOT NULL,
  notification_type VARCHAR(20) CHECK (notification_type IN ('browser', 'email')) DEFAULT 'browser',
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  related_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  related_calendar_id UUID REFERENCES public.calendars(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_events_calendar_time ON public.events(calendar_id, start_time, end_time);
CREATE INDEX idx_calendar_members_user ON public.calendar_members(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_event_reminders_schedule ON public.event_reminders(remind_before_minutes, is_sent);
CREATE INDEX idx_calendars_owner ON public.calendars(owner_id);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- Ensure only one default calendar per user
CREATE UNIQUE INDEX unique_default_calendar_per_user 
ON public.calendars (owner_id) 
WHERE is_default = true;

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Calendars policies
CREATE POLICY "Users can view calendars they are members of" ON public.calendars
  FOR SELECT USING (
    id IN (
      SELECT calendar_id FROM public.calendar_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert calendars" ON public.calendars
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Calendar owners can update calendars" ON public.calendars
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Calendar owners can delete calendars" ON public.calendars
  FOR DELETE USING (auth.uid() = owner_id);

-- Calendar members policies
CREATE POLICY "Users can view calendar members for their calendars" ON public.calendar_members
  FOR SELECT USING (
    calendar_id IN (
      SELECT calendar_id FROM public.calendar_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Calendar owners can manage members" ON public.calendar_members
  FOR ALL USING (
    calendar_id IN (
      SELECT id FROM public.calendars WHERE owner_id = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "Users can view events from their calendars" ON public.events
  FOR SELECT USING (
    calendar_id IN (
      SELECT calendar_id FROM public.calendar_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events in calendars they have editor access" ON public.events
  FOR INSERT WITH CHECK (
    calendar_id IN (
      SELECT calendar_id FROM public.calendar_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can update events they created or in calendars they have editor access" ON public.events
  FOR UPDATE USING (
    created_by = auth.uid() OR
    calendar_id IN (
      SELECT calendar_id FROM public.calendar_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can delete events they created or in calendars they own" ON public.events
  FOR DELETE USING (
    created_by = auth.uid() OR
    calendar_id IN (
      SELECT calendar_id FROM public.calendar_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Event reminders policies
CREATE POLICY "Users can view their own reminders" ON public.event_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders" ON public.event_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON public.event_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON public.event_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions

-- Function to generate random invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create calendar membership for owner
CREATE OR REPLACE FUNCTION create_calendar_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.calendar_members (calendar_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create owner membership when calendar is created
CREATE TRIGGER trigger_create_calendar_owner_membership
  AFTER INSERT ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION create_calendar_owner_membership();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'New User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();