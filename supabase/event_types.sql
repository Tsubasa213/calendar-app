-- 予定ジャンル（タイプ）テーブル
CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES public.calendars(id) ON DELETE CASCADE,
  name VARCHAR(20) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_types_calendar ON public.event_types(calendar_id);
