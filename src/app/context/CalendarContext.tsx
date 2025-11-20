"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { EventType } from "@/types/event.types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";

interface CalendarContextType {
  goToToday: (() => void) | null;
  setGoToToday: (callback: () => void) => void;
  openAddEventModal: (() => void) | null;
  setOpenAddEventModal: (callback: () => void) => void;
  currentCalendarId: string | null;
  setCurrentCalendarId: (id: string | null) => void;
  eventTypes: EventType[];
  setEventTypes: (types: EventType[]) => void;
  refreshEventTypes: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [goToToday, setGoToTodayState] = useState<(() => void) | null>(null);
  const [openAddEventModal, setOpenAddEventModalState] = useState<
    (() => void) | null
  >(null);
  const [currentCalendarId, setCurrentCalendarId] = useState<string | null>(
    null
  );
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  // カレンダーIDが変わったらジャンルを取得
  useEffect(() => {
    if (currentCalendarId) {
      refreshEventTypes();
    } else {
      setEventTypes([]);
    }
  }, [currentCalendarId]);

  // 初回読み込み時にデフォルトカレンダーを設定
  useEffect(() => {
    if (user && !currentCalendarId) {
      loadDefaultCalendar();
    }
  }, [user]);

  const loadDefaultCalendar = async () => {
    try {
      // LocalStorageから最後に開いたカレンダーを取得
      const savedCalendarId = localStorage.getItem("currentCalendarId");
      if (savedCalendarId) {
        setCurrentCalendarId(savedCalendarId);
        return;
      }

      // なければRPCでユーザーのカレンダーを取得
      const { data, error } = await supabase.rpc(
        "get_my_calendars_with_members"
      );

      if (error) throw error;

      // JSONBデータをパース
      const calendars = Array.isArray(data) ? data : [];

      // デフォルトカレンダーを優先、なければ最初のカレンダー
      const defaultCalendar =
        calendars.find((c: any) => c.is_default) || calendars[0];

      if (defaultCalendar?.id) {
        setCurrentCalendarId(defaultCalendar.id);
        localStorage.setItem("currentCalendarId", defaultCalendar.id);
      }
    } catch (error) {
      console.error("デフォルトカレンダー取得エラー:", error);
    }
  };

  const refreshEventTypes = async () => {
    if (!currentCalendarId) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("calendar_id", currentCalendarId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setEventTypes(data || []);
    } catch (error) {
      console.error("ジャンル取得エラー:", error);
      setEventTypes([]);
    }
  };

  const setGoToToday = (callback: () => void) => {
    setGoToTodayState(() => callback);
  };

  const setOpenAddEventModal = (callback: () => void) => {
    setOpenAddEventModalState(() => callback);
  };

  // カレンダーIDが変わったらLocalStorageに保存
  useEffect(() => {
    if (currentCalendarId) {
      localStorage.setItem("currentCalendarId", currentCalendarId);
    }
  }, [currentCalendarId]);

  return (
    <CalendarContext.Provider
      value={{
        goToToday,
        setGoToToday,
        openAddEventModal,
        setOpenAddEventModal,
        currentCalendarId,
        setCurrentCalendarId,
        eventTypes,
        setEventTypes,
        refreshEventTypes,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
