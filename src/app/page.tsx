"use client";

import { useState, useEffect } from "react";
import CalendarComponent from "@/app/_components/Calendar";
import EditCalendarModal from "@/app/_components/EditCalendarModal";
import { useCalendar } from "@/app/context/CalendarContext";
import { EventType } from "@/types/event.types";
import { CalendarWithMembers } from "@/types/calendar.types";
import { createClient } from "@/lib/supabase/client";
import ShareCalendarModal from "@/app/_components/ShareCalendarModal";
import { faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Page() {
  const {
    setGoToToday,
    setOpenAddEventModal,
    currentCalendarId,
    eventTypes,
    setEventTypes,
    refreshEventTypes,
  } = useCalendar();

  const supabase = createClient();
  const [currentCalendar, setCurrentCalendar] =
    useState<CalendarWithMembers | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCalendarId) {
      fetchCalendar();
    } else {
      setLoading(false);
    }
  }, [currentCalendarId]);

  const fetchCalendar = async () => {
    if (!currentCalendarId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // --- 修正点: `select` クエリを変更 ---
      const { data, error } = await supabase
        .from("calendars")
        .select(
          `
          *,
          members:calendar_members(
            *,
            user:users(id, name, avatar_url)
          )
        `
        )
        .eq("id", currentCalendarId)
        .single();

      if (error) throw error;

      setCurrentCalendar(data as CalendarWithMembers);
    } catch (error) {
      console.error("カレンダー取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCalendar = async (data: {
    name: string;
    description: string;
    icon: string;
    eventTypes: EventType[];
  }) => {
    if (!currentCalendar || !currentCalendarId) {
      console.log(
        "エラー: currentCalendar または currentCalendarId がありません"
      );
      return;
    }
    try {
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

      const { error: deleteError } = await supabase
        .from("event_types")
        .delete()
        .eq("calendar_id", currentCalendarId);
      if (deleteError) throw deleteError;

      if (data.eventTypes.length > 0) {
        const typesToInsert = data.eventTypes.map((type) => ({
          calendar_id: currentCalendarId,
          name: type.name,
          color: type.color,
          created_at: new Date().toISOString(),
        }));
        const { error: insertError } = await supabase
          .from("event_types")
          .insert(typesToInsert);
        if (insertError) {
          console.error("挿入エラー:", insertError);
          throw insertError;
        }
      }

      await refreshEventTypes();
      setIsEditModalOpen(false);
      await fetchCalendar();
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

  return (
    <>
      <CalendarComponent
        onCalendarReady={handleCalendarReady}
        onAddEventReady={handleAddEventReady}
        eventTypes={eventTypes}
      />

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

      {currentCalendar && (
        <ShareCalendarModal
          isOpen={isShareModalOpen}
          calendar={currentCalendar}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {currentCalendarId && !loading && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-row gap-3 lg:bottom-4">
          <button
            onClick={() => {
              if (currentCalendar) {
                setIsEditModalOpen(true);
              } else {
                alert("カレンダー情報を読み込み中です。");
              }
            }}
            className="rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
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

          <button
            onClick={() => {
              if (currentCalendar) {
                setIsShareModalOpen(true);
              } else {
                alert("カレンダー情報を読み込み中です。");
              }
            }}
            className="rounded-full bg-green-600 p-4 text-white shadow-lg hover:bg-green-700"
            title="カレンダーを共有"
          >
            <FontAwesomeIcon icon={faShareAlt} className="size-6" />
          </button>
        </div>
      )}
    </>
  );
}
