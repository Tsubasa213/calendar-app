"use client";

import { useState, useEffect } from "react";
import CalendarComponent from "@/app/_components/Calendar";
import EditCalendarModal from "@/app/_components/modals/EditCalendarModal";
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

  const supabase = createClient();
  const [currentCalendar, setCurrentCalendar] =
    useState<CalendarWithMembers | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    </>
  );
}
