"use client";

import { useState, useEffect } from "react";
import CalendarComponent from "@/app/_components/Calendar";
import EditCalendarModal from "@/app/_components/EditCalendarModal";
import { useCalendar } from "@/app/context/CalendarContext";
import { EventType } from "@/types/event.types";
import { CalendarWithMembers } from "@/types/calendar.types";
import { createClient } from "@/lib/supabase/client";

export default function Page() {
  const {
    setGoToToday,
    setOpenAddEventModal,
    currentCalendarId,
    eventTypes,
    setEventTypes,
    refreshEventTypes,
  } = useCalendar();

  console.log("Page.tsx - currentCalendarId:", currentCalendarId);
  console.log("Page.tsx - eventTypes:", eventTypes);

  const supabase = createClient();
  const [currentCalendar, setCurrentCalendar] =
    useState<CalendarWithMembers | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // カレンダーIDが変わったらカレンダー情報を取得
  useEffect(() => {
    if (currentCalendarId) {
      console.log("Current Calendar ID:", currentCalendarId);
      fetchCalendar();
    }
    setLoading(false);
  }, [currentCalendarId]);

  // カレンダー情報を取得
  const fetchCalendar = async () => {
    if (!currentCalendarId) return;

    try {
      const { data, error } = await supabase
        .from("calendars")
        .select(
          `
          *,
          calendar_members!inner(user_id, role)
        `
        )
        .eq("id", currentCalendarId)
        .single();

      if (error) throw error;
      setCurrentCalendar(data);
    } catch (error) {
      console.error("カレンダー取得エラー:", error);
    }
  };

  // カレンダー設定を保存
  const handleSaveCalendar = async (data: {
    name: string;
    description: string;
    icon: string;
    eventTypes: EventType[];
  }) => {
    console.log("=== handleSaveCalendar 開始 ===");
    console.log("保存するデータ:", data);
    console.log("eventTypes:", data.eventTypes);
    if (!currentCalendar || !currentCalendarId) {
      console.log(
        "エラー: currentCalendar または currentCalendarId がありません"
      );
      return;
    }
    try {
      // カレンダー情報を更新
      console.log("1. カレンダー情報を更新中...");
      const { error: calendarError } = await supabase
        .from("calendars")
        .update({
          name: data.name,
          description: data.description,
          icon: data.icon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentCalendarId);
      if (calendarError) throw calendarError;
      console.log("1. カレンダー情報の更新完了");
      // 既存のジャンルを削除
      console.log("2. 既存ジャンルを削除中...");
      const { error: deleteError } = await supabase
        .from("event_types")
        .delete()
        .eq("calendar_id", currentCalendarId);
      if (deleteError) throw deleteError;
      console.log("2. 既存ジャンルの削除完了");
      // 新しいジャンルを挿入
      if (data.eventTypes.length > 0) {
        console.log("3. 新しいジャンルを挿入中...");
        const typesToInsert = data.eventTypes.map((type) => ({
          id: type.id,
          calendar_id: currentCalendarId,
          name: type.name,
          color: type.color,
          created_at: new Date().toISOString(),
        }));
        console.log("挿入するデータ:", typesToInsert);
        const { error: insertError } = await supabase
          .from("event_types")
          .insert(typesToInsert);
        if (insertError) {
          console.error("挿入エラー:", insertError);
          throw insertError;
        }
        console.log("3. 新しいジャンルの挿入完了");
      } else {
        console.log("3. 挿入するジャンルがありません");
      }
      // Contextのジャンルを更新
      console.log("4. Contextを更新中...");
      await refreshEventTypes();
      setIsEditModalOpen(false);
      // カレンダー情報を再取得
      await fetchCalendar();
      console.log("=== handleSaveCalendar 完了 ===");
      alert("カレンダー設定を保存しました");
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました");
    }
  };

  const handleChangeEventTypes = (types: EventType[]) => {
    setEventTypes(types);
  };

  const handleCalendarReady = (goToToday: () => void) => {
    setGoToToday(goToToday);
  };

  const handleAddEventReady = (openAddEventModal: () => void) => {
    setOpenAddEventModal(openAddEventModal);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <CalendarComponent
        onCalendarReady={handleCalendarReady}
        onAddEventReady={handleAddEventReady}
        eventTypes={eventTypes}
      />

      {/* カレンダー設定モーダル */}
      {currentCalendar && (
        <EditCalendarModal
          isOpen={isEditModalOpen}
          calendar={currentCalendar}
          eventTypes={eventTypes}
          onChangeEventTypes={handleChangeEventTypes}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveCalendar}
        />
      )}

      {/* 設定ボタン（フローティング） */}
      <button
        onClick={() => setIsEditModalOpen(true)}
        className="fixed bottom-20 right-4 z-50 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700 lg:bottom-4"
        title="カレンダー設定"
      >
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </>
  );
}
