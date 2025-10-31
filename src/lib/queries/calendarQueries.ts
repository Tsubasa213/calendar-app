import { createClient } from "@/lib/supabase/client";
import type {
  Calendar,
  CalendarWithMembers,
  CreateCalendarInput,
  UpdateCalendarInput,
  JoinCalendarResult,
  CalendarStats,
  CalendarMemberWithUser, // 1. このインポートが必要です
} from "@/types/calendar.types";

const supabase = createClient();

// 2. --- ▼ 修正点: 削除されていた generateInviteCode 関数を再追加 ▼ ---
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
// --- ▲ 修正点 ▲ ---

/**
 * Get all calendars for the current user
 */
export async function getUserCalendars(): Promise<CalendarWithMembers[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // RLSをバイパスするRPC(DB関数)を呼び出す
  const { data, error } = await supabase.rpc("get_my_calendars_with_members");

  if (error) {
    console.error("Error fetching user calendars (RPC):", error);
    throw error;
  }

  if (!data) {
    return [];
  }

  // 3. --- ▼ 修正点: RPC (JSONB) からのデータを安全にパース ▼ ---
  // data (JSONB) を CalendarWithMembers[] に変換
  const calendars: CalendarWithMembers[] = (data as any[]).map((c: any) => {
    // SupabaseのRPCがJSONBを文字列として返すか、自動でパースするかは環境によるため、両対応
    const membersList =
      (typeof c.members === "string" ? JSON.parse(c.members) : c.members) || [];

    return {
      ...c,
      members: membersList as CalendarMemberWithUser[],
      member_count: membersList.length,
    };
  });
  // --- ▲ 修正点 ▲ ---

  calendars.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return calendars;
}

/**
 * Get a single calendar by ID with members
 */
export async function getCalendarById(
  id: string
): Promise<CalendarWithMembers | null> {
  // RLS(SELECT)を削除したため、RPC(getUserCalendars)経由で取得
  const allCalendars = await getUserCalendars();
  const calendar = allCalendars.find((c) => c.id === id);

  if (calendar) {
    return calendar;
  } else {
    // ユーザーがメンバーでないカレンダーIDが要求された
    return null;
  }
}

/**
 * Get a calendar by invite code (for joining)
 */
export async function getCalendarByInviteCode(
  inviteCode: string
): Promise<CalendarWithMembers | null> {
  // RPC は単一行を返す想定だが、.single() をチェーンできないクライアント実装があるため
  // rpc の戻り値を直接受け取り、data を扱うようにする
  const { data, error } = await supabase.rpc("get_calendar_by_invite", {
    p_invite_code: inviteCode,
  });

  if (error) {
    console.error("Error fetching calendar by invite code:", error);
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  if (!data) return null;

  // 4. --- ▼ 修正点: (membersArray エラー) RPC関数の型定義に対応 ▼ ---
  // (get_calendar_by_invite は members を JSONB オブジェクトとして返す)
  // ここでも同様に、JSON文字列かオブジェクトかの両方に対応
  const membersList =
    (typeof data.members === "string"
      ? JSON.parse(data.members)
      : data.members) || [];
  const membersArray = membersList as CalendarMemberWithUser[];
  // --- ▲ 修正点 ▲ ---

  return {
    ...(data as any),
    members: membersArray,
    member_count: membersArray.length,
  };
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
      invite_code: generateInviteCode(), // 5. --- ▼ 修正点: 復活させたJS関数を呼ぶ ▼ ---
      is_default: false,
    })
    .select()
    .single();
  // --- ▲ 修正点 ▲ ---

  if (error) {
    if (error.message.includes("maximum of 2 non-default calendars")) {
      throw new Error("作成できるカレンダーは最大2つまでです");
    }
    // RLS違反やその他のエラー
    console.error("createCalendar error:", error);
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

  const calendar = await getCalendarByInviteCode(inviteCode);
  if (!calendar) {
    return {
      success: false,
      message: "招待コードが無効です",
    };
  }

  if (calendar.is_default) {
    return {
      success: false,
      message: "このカレンダーには参加できません",
    };
  }

  const isAlreadyMember = calendar.members?.some((m) => m.user_id === user.id);
  if (isAlreadyMember) {
    return {
      success: false,
      message: "すでにこのカレンダーのメンバーです",
    };
  }

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
    console.error("joinCalendar error:", error);
    throw error;
  }

  // (getCalendarByIdがRPCを使うようになったので、ここで取得してもOK)
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

  const { data, error } = await supabase.rpc("get_my_calendar_stats");

  if (error) {
    console.error("Error fetching calendar stats (RPC):", error);
    throw error;
  }

  if (!data) {
    throw new Error("Could not retrieve stats.");
  }

  return data as CalendarStats;
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
