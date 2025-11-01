-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_my_calendars_with_members();
DROP FUNCTION IF EXISTS public.get_calendar_by_invite(TEXT);
DROP FUNCTION IF EXISTS public.get_calendar_by_invite(VARCHAR);

-- Create RPC function to get user's calendars with members
-- This bypasses RLS issues when fetching related data

CREATE OR REPLACE FUNCTION public.get_my_calendars_with_members()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'id', c.id,
      'name', c.name,
      'description', c.description,
      'color', c.color,
      'icon', c.icon,
      'owner_id', c.owner_id,
      'is_public', c.is_public,
      'is_default', c.is_default,
      'invite_code', c.invite_code,
      'created_at', c.created_at,
      'updated_at', c.updated_at,
      'members', (
        SELECT JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id', cm.id,
            'calendar_id', cm.calendar_id,
            'user_id', cm.user_id,
            'role', cm.role,
            'joined_at', cm.joined_at,
            'user', JSONB_BUILD_OBJECT(
              'id', u.id,
              'name', u.name,
              'avatar_url', u.avatar_url
            )
          )
        )
        FROM public.calendar_members cm
        JOIN public.users u ON u.id = cm.user_id
        WHERE cm.calendar_id = c.id
      )
    )
  )
  INTO result
  FROM public.calendars c
  WHERE c.id IN (
    SELECT calendar_id 
    FROM public.calendar_members 
    WHERE user_id = auth.uid()
  );

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- Create RPC function to get calendar by invite code
CREATE OR REPLACE FUNCTION public.get_calendar_by_invite(p_invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT JSONB_BUILD_OBJECT(
    'id', c.id,
    'name', c.name,
    'description', c.description,
    'color', c.color,
    'icon', c.icon,
    'owner_id', c.owner_id,
    'is_public', c.is_public,
    'is_default', c.is_default,
    'invite_code', c.invite_code,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'members', (
      SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', cm.id,
          'calendar_id', cm.calendar_id,
          'user_id', cm.user_id,
          'role', cm.role,
          'joined_at', cm.joined_at,
          'user', JSONB_BUILD_OBJECT(
            'id', u.id,
            'name', u.name,
            'avatar_url', u.avatar_url
          )
        )
      )
      FROM public.calendar_members cm
      JOIN public.users u ON u.id = cm.user_id
      WHERE cm.calendar_id = c.id
    )
  )
  INTO result
  FROM public.calendars c
  WHERE c.invite_code = p_invite_code;

  RETURN result;
END;
$$;
