export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendars: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string;
          owner_id: string;
          is_public: boolean;
          invite_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string;
          owner_id: string;
          is_public?: boolean;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          owner_id?: string;
          is_public?: boolean;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_members: {
        Row: {
          id: string;
          calendar_id: string;
          user_id: string;
          role: "owner" | "editor" | "viewer";
          joined_at: string;
        };
        Insert: {
          id?: string;
          calendar_id: string;
          user_id: string;
          role?: "owner" | "editor" | "viewer";
          joined_at?: string;
        };
        Update: {
          id?: string;
          calendar_id?: string;
          user_id?: string;
          role?: "owner" | "editor" | "viewer";
          joined_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          calendar_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          is_all_day: boolean;
          location: string | null;
          color: string | null;
          recurrence_rule: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          is_all_day?: boolean;
          location?: string | null;
          color?: string | null;
          recurrence_rule?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          calendar_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          is_all_day?: boolean;
          location?: string | null;
          color?: string | null;
          recurrence_rule?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_reminders: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          remind_before_minutes: number;
          notification_type: "browser" | "email";
          is_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          remind_before_minutes: number;
          notification_type?: "browser" | "email";
          is_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          remind_before_minutes?: number;
          notification_type?: "browser" | "email";
          is_sent?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          is_read: boolean;
          related_event_id: string | null;
          related_calendar_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          is_read?: boolean;
          related_event_id?: string | null;
          related_calendar_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          is_read?: boolean;
          related_event_id?: string | null;
          related_calendar_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Calendar = Database["public"]["Tables"]["calendars"]["Row"];
export type CalendarMember =
  Database["public"]["Tables"]["calendar_members"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventReminder =
  Database["public"]["Tables"]["event_reminders"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type CalendarInsert =
  Database["public"]["Tables"]["calendars"]["Insert"];
export type CalendarMemberInsert =
  Database["public"]["Tables"]["calendar_members"]["Insert"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventReminderInsert =
  Database["public"]["Tables"]["event_reminders"]["Insert"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type CalendarUpdate =
  Database["public"]["Tables"]["calendars"]["Update"];
export type CalendarMemberUpdate =
  Database["public"]["Tables"]["calendar_members"]["Update"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
export type EventReminderUpdate =
  Database["public"]["Tables"]["event_reminders"]["Update"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];
