# データベース設計

## テーブル構造

### 1. users（ユーザー）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. calendars（カレンダー）

```sql
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- HEX color code
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  invite_code VARCHAR(20) UNIQUE, -- 招待用コード
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. calendar_members（カレンダーメンバー）

```sql
CREATE TABLE calendar_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(calendar_id, user_id)
);
```

### 4. events（イベント）

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  color VARCHAR(7),
  recurrence_rule TEXT, -- RRULE format for recurring events
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. event_reminders（リマインダー）

```sql
CREATE TABLE event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  remind_before_minutes INTEGER NOT NULL, -- 何分前に通知するか
  notification_type VARCHAR(20) CHECK (notification_type IN ('browser', 'email')) DEFAULT 'browser',
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. notifications（通知履歴）

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'event_reminder', 'calendar_shared', 'event_updated'
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  related_calendar_id UUID REFERENCES calendars(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## インデックス設計

```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_events_calendar_time ON events(calendar_id, start_time, end_time);
CREATE INDEX idx_calendar_members_user ON calendar_members(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_event_reminders_schedule ON event_reminders(remind_before_minutes, is_sent);
```

## RLS (Row Level Security) 設定

Supabaseを使用する場合のセキュリティ設定

```sql
-- カレンダーのRLS
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view calendars they are members of" ON calendars
  FOR SELECT USING (
    id IN (
      SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid()
    )
  );

-- イベントのRLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view events from their calendars" ON events
  FOR SELECT USING (
    calendar_id IN (
      SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid()
    )
  );
```
