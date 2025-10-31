import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Event, DbEvent, EventFormData, EventType } from "@/types/event.types";
import {
  convertDbEventToCalendarEvent,
  updateEventInList,
} from "@/lib/utils/eventUtils";
import { calculateDaysDiff } from "@/lib/utils/dateUtils";
import { useCalendar } from "@/app/context/CalendarContext";

export function useEvents(eventTypes: EventType[]) {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCalendarId } = useCalendar();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentCalendarId) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setEvents([
            {
              id: "1",
              title: "サンプル: 会議",
              start: new Date().toISOString().split("T")[0] + "T10:00:00",
              end: new Date().toISOString().split("T")[0] + "T11:00:00",
              color: "#3B82F6",
            },
          ]);
          setIsLoading(false);
          return;
        }

        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("calendar_id", currentCalendarId);

        if (eventsError) {
          console.error("イベント取得エラー:", eventsError);
          setIsLoading(false);
          return;
        }

        const formattedEvents: Event[] = (eventsData || []).map(
          (event: DbEvent) => convertDbEventToCalendarEvent(event)
        );

        setEvents(formattedEvents);
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [supabase, currentCalendarId]);

  // イベントを追加
  const addEvent = async (formData: EventFormData) => {
    if (!currentCalendarId) {
      throw new Error("カレンダーが選択されていません");
    }

    const selectedGenre = eventTypes.find((type) => type.id === formData.genre);
    const eventColor = selectedGenre ? selectedGenre.color : "#3B82F6";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate || formData.startDate);
      const daysDiff = calculateDaysDiff(
        formData.startDate,
        formData.endDate || formData.startDate
      );

      // (複数日イベントのロジックは変更なし ... )
      if (!formData.allDay && daysDiff > 0) {
        // ... (省略) ...
        const newEvents: Event[] = [];

        for (let i = 0; i <= daysDiff; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dateStr = currentDate.toISOString().split("T")[0];
          const startTime = `${dateStr}T${formData.startTime || "09:00"}:00`;
          const endTime = `${dateStr}T${formData.endTime || "10:00"}:00`;

          if (!user) {
            const event: Event = {
              id: `${Date.now()}_${i}`,
              title: formData.title,
              start: startTime,
              end: endTime,
              allDay: false,
              color: eventColor,
            };
            newEvents.push(event);
          } else {
            const { data: eventData, error } = await supabase
              .from("events")
              .insert({
                calendar_id: currentCalendarId,
                title: formData.title,
                start_time: startTime,
                end_time: endTime,
                is_all_day: false,
                color: eventColor,
                created_by: user.id,
                description: formData.memo || null,
              })
              .select()
              .single();

            if (error) {
              console.error("イベント保存エラー:", error);
              continue;
            }
            newEvents.push(convertDbEventToCalendarEvent(eventData));
          }
        }
        setEvents([...events, ...newEvents]);
        return;
      }

      // (単一日イベントのロジックは変更なし ...)
      const startTime = formData.allDay
        ? `${formData.startDate}T00:00:00`
        : `${formData.startDate}T${formData.startTime || "09:00"}:00`;
      const endTime = formData.allDay
        ? `${formData.endDate || formData.startDate}T23:59:59`
        : `${formData.endDate || formData.startDate}T${formData.endTime || "10:00"}:00`;

      if (!user) {
        const newEvent: Event = {
          id: String(Date.now()),
          title: formData.title,
          start: formData.allDay ? formData.startDate : startTime,
          end: formData.allDay
            ? (() => {
                const endDate = new Date(
                  formData.endDate || formData.startDate
                );
                endDate.setDate(endDate.getDate() + 1);
                return endDate.toISOString().split("T")[0];
              })()
            : endTime,
          allDay: formData.allDay,
          color: eventColor,
        };
        setEvents([...events, newEvent]);
        return;
      }

      const { data: newEventData, error } = await supabase
        .from("events")
        .insert({
          calendar_id: currentCalendarId,
          title: formData.title,
          start_time: startTime,
          end_time: endTime,
          is_all_day: formData.allDay,
          color: eventColor,
          created_by: user.id,
          description: formData.memo || null,
        })
        .select()
        .single();

      if (error) {
        console.error("イベント保存エラー:", error);
        throw new Error("予定の保存に失敗しました");
      }
      const newEvent: Event = convertDbEventToCalendarEvent(newEventData);
      setEvents([...events, newEvent]);
    } catch (error) {
      console.error("予期しないエラー:", error);
      throw error;
    }
  };

  // イベントを削除
  const deleteEvent = async (eventId: string) => {
    if (!currentCalendarId) {
      console.warn("カレンダーIDがないためローカル削除のみ実行");
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && currentCalendarId) {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId);

        if (error) {
          console.error("イベント削除エラー:", error);
          throw new Error("予定の削除に失敗しました");
        }
      }
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error("予期しないエラー:", error);
      throw error;
    }
  };

  // --- ▼ 修正点 1/2: `updateEvent` を `updateEventTime` にリネーム ▼ ---
  // (ドラッグ&ドロップ用)
  const updateEventTime = async (
    // --- ▲ 修正点 1/2 ▲ ---
    eventId: string,
    newStartTime: string,
    newEndTime: string,
    isAllDay: boolean
  ) => {
    if (!currentCalendarId) {
      console.warn("カレンダーIDがないためローカル更新のみ実行");
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !currentCalendarId) {
        const updatedEvents = updateEventInList(
          events,
          eventId,
          newStartTime,
          newEndTime,
          isAllDay
        );
        setEvents(updatedEvents);
        return;
      }

      const { error } = await supabase
        .from("events")
        .update({
          start_time: newStartTime,
          end_time: newEndTime,
          is_all_day: isAllDay,
        })
        .eq("id", eventId);

      if (error) {
        console.error("イベント更新エラー:", error);
        throw new Error("予定の更新に失敗しました");
      }

      const updatedEvents = updateEventInList(
        events,
        eventId,
        newStartTime,
        newEndTime,
        isAllDay
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("予期しないエラー:", error);
      throw error;
    }
  };

  // --- ▼ 修正点 2/2: 新しい関数 `updateEventDetails` を追加 ▼ ---
  // (モーダル編集用)
  const updateEventDetails = async (formData: EventFormData) => {
    if (!formData.id || !currentCalendarId) {
      throw new Error("更新対象のIDまたはカレンダーIDがありません");
    }

    const selectedGenre = eventTypes.find((type) => type.id === formData.genre);
    const eventColor = selectedGenre ? selectedGenre.color : "#3B82F6";

    try {
      // フォームデータからDB保存用の形式に変換
      const startTime = formData.allDay
        ? `${formData.startDate}T00:00:00`
        : `${formData.startDate}T${formData.startTime || "09:00"}:00`;
      const endTime = formData.allDay
        ? `${formData.endDate || formData.startDate}T23:59:59`
        : `${formData.endDate || formData.startDate}T${formData.endTime || "10:00"}:00`;

      const { data: updatedEventData, error } = await supabase
        .from("events")
        .update({
          title: formData.title,
          start_time: startTime,
          end_time: endTime,
          is_all_day: formData.allDay,
          color: eventColor,
          description: formData.memo || null,
          // calendar_id, created_by は変更しない
        })
        .eq("id", formData.id)
        .select()
        .single();

      if (error) {
        console.error("イベント更新エラー:", error);
        throw new Error("予定の更新に失敗しました");
      }

      // 成功時、ローカルの状態も更新
      const convertedEvent = convertDbEventToCalendarEvent(updatedEventData);
      setEvents(
        events.map((e) => (e.id === convertedEvent.id ? convertedEvent : e))
      );
    } catch (error) {
      console.error("予期しないエラー:", error);
      throw error;
    }
  };
  // --- ▲ 修正点 2/2 ▲ ---

  return {
    events,
    isLoading,
    addEvent,
    deleteEvent,
    updateEventTime, // リネーム
    updateEventDetails, // 新しくエクスポート
  };
}
