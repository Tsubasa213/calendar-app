import { createClient } from "@/lib/supabase/client";
import type {
  Calendar,
  CalendarWithMembers,
  CreateCalendarInput,
  UpdateCalendarInput,
  JoinCalendarResult,
  CalendarStats,
  CalendarMemberWithUser,
} from "@/types/calendar.types";

const supabase = createClient();

/**
 * Get all calendars for the current user
 */
export async function getUserCalendars(): Promise<CalendarWithMembers[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("calendars")
    .select(
      `
      *,
      members:calendar_members(
        *,
        user:users(*)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((calendar: any) => ({
    ...calendar,
    member_count: calendar.members?.length || 0,
  }));
}

/**
 * Get a single calendar by ID with members
 */
export async function getCalendarById(
  id: string
): Promise<CalendarWithMembers | null> {
  const { data, error } = await supabase
    .from("calendars")
    .select(
      `
      *,
      members:calendar_members(
        *,
        user:users(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    ...data,
    member_count: data.members?.length || 0,
  };
}

/**
 * Get a calendar by invite code (for joining)
 */
export async function getCalendarByInviteCode(
  inviteCode: string
): Promise<CalendarWithMembers | null> {
  const { data, error } = await supabase
    .from("calendars")
    .select(
      `
      *,
      members:calendar_members(
        *,
        user:users(*)
      )
    `
    )
    .eq("invite_code", inviteCode)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    ...data,
    member_count: data.members?.length || 0,
  };
}

/**
 * Generate a random invite code
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new calendar
 */
export async function createCalendar(
  input: CreateCalendarInput
): Promise<Calendar> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("calendars")
    .insert({
      name: input.name,
      description: input.description,
      color: input.color || "#3B82F6",
      icon: input.icon || "📅",
      owner_id: user.id,
      invite_code: generateInviteCode(),
    })
    .select()
    .single();

  if (error) {
    // Handle specific constraint violations
    if (error.message.includes("maximum of 2 calendars")) {
      throw new Error("カレンダーは最大2つまで作成できます");
    }
    throw error;
  }

  return data;
}

/**
 * Update a calendar
 */
export async function updateCalendar(
  id: string,
  input: UpdateCalendarInput
): Promise<Calendar> {
  const { data, error } = await supabase
    .from("calendars")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a calendar
 */
export async function deleteCalendar(id: string): Promise<void> {
  const { error } = await supabase.from("calendars").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Join a calendar using invite code
 */
export async function joinCalendar(
  inviteCode: string
): Promise<JoinCalendarResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "ログインが必要です",
    };
  }

  // Get the calendar
  const calendar = await getCalendarByInviteCode(inviteCode);
  if (!calendar) {
    return {
      success: false,
      message: "招待コードが無効です",
    };
  }

  // Check if user is already a member
  const isAlreadyMember = calendar.members?.some((m) => m.user_id === user.id);
  if (isAlreadyMember) {
    return {
      success: false,
      message: "すでにこのカレンダーのメンバーです",
    };
  }

  // Add user as a member
  const { error } = await supabase.from("calendar_members").insert({
    calendar_id: calendar.id,
    user_id: user.id,
    role: "viewer",
  });

  if (error) {
    if (error.message.includes("maximum of 8 members")) {
      return {
        success: false,
        message: "このカレンダーは満員です（最大8人）",
      };
    }
    if (error.message.includes("maximum of 3 shared calendars")) {
      return {
        success: false,
        message: "参加できるカレンダーは最大3つまでです",
      };
    }
    throw error;
  }

  // Fetch updated calendar
  const updatedCalendar = await getCalendarById(calendar.id);

  return {
    success: true,
    message: "カレンダーに参加しました",
    calendar: updatedCalendar || undefined,
  };
}

/**
 * Leave a calendar
 */
export async function leaveCalendar(calendarId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("calendar_members")
    .delete()
    .eq("calendar_id", calendarId)
    .eq("user_id", user.id);

  if (error) throw error;
}

/**
 * Get calendar statistics for the current user
 */
export async function getCalendarStats(): Promise<CalendarStats> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get owned calendars count
  const { count: ownedCount } = await supabase
    .from("calendars")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  // Get participated calendars count (excluding owned)
  const { data: memberships } = await supabase
    .from("calendar_members")
    .select("calendar_id, calendars!inner(owner_id)")
    .eq("user_id", user.id);

  const participatedCount =
    memberships?.filter((m: any) => m.calendars.owner_id !== user.id).length ||
    0;

  return {
    owned_calendars: ownedCount || 0,
    participated_calendars: participatedCount,
    can_create_more: (ownedCount || 0) < 2,
    can_join_more: participatedCount < 3,
  };
}

/**
 * Get the invite URL for a calendar
 */
export function getInviteUrl(inviteCode: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/invite/${inviteCode}`;
  }
  return `/invite/${inviteCode}`;
}

/**
 * Subscribe to calendar changes (Realtime)
 */
export function subscribeToCalendar(
  calendarId: string,
  onUpdate: (calendar: Calendar) => void
) {
  const channel = supabase
    .channel(`calendar:${calendarId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calendars",
        filter: `id=eq.${calendarId}`,
      },
      (payload) => {
        onUpdate(payload.new as Calendar);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to calendar members changes (Realtime)
 */
export function subscribeToCalendarMembers(
  calendarId: string,
  onMembersChange: () => void
) {
  const channel = supabase
    .channel(`calendar_members:${calendarId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calendar_members",
        filter: `calendar_id=eq.${calendarId}`,
      },
      () => {
        onMembersChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
