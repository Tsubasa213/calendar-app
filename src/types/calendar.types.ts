// Calendar related types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  owner_id: string;
  is_public: boolean;
  invite_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarMember {
  id: string;
  calendar_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  joined_at: string;
}

export interface CalendarWithMembers extends Calendar {
  members: CalendarMemberWithUser[];
  member_count: number;
}

export interface CalendarMemberWithUser extends CalendarMember {
  user: User;
}

export interface CreateCalendarInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCalendarInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface JoinCalendarResult {
  success: boolean;
  message: string;
  calendar?: CalendarWithMembers;
}

export interface CalendarStats {
  owned_calendars: number;
  participated_calendars: number;
  can_create_more: boolean;
  can_join_more: boolean;
}
