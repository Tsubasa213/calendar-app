import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Event, DbEvent, EventFormData } from "@/types/event.types";
import {
  convertDbEventToCalendarEvent,
  updateEventInList,
} from "@/lib/utils/eventUtils";
import { calculateDaysDiff } from "@/lib/utils/dateUtils";

export function useEvents() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultCalendarId, setDefaultCalendarId] = useState<string | null>(
    null
  );

  // データベースからイベントを取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // まず、デフォルトのカレンダーを取得または作成
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // ユーザーがログインしていない場合は、サンプルデータを表示
          setEvents([
            {
              id: "1",
              title: "会議",
              start: "2025-10-02T10:00:00",
              end: "2025-10-02T11:00:00",
              color: "#3B82F6",
            },
            {
              id: "2",
              title: "ランチ",
              start: "2025-10-05T12:00:00",
              end: "2025-10-05T13:00:00",
              color: "#10B981",
            },
            {
              id: "3",
              title: "全日イベント",
              start: "2025-10-08",
              allDay: true,
              color: "#F59E0B",
            },
          ]);
          setIsLoading(false);
          return;
        }

        // カレンダーを取得または作成
        let { data: calendars } = await supabase
          .from("calendars")
          .select("*")
          .eq("owner_id", user.id)
          .limit(1);

        let calendarId: string;

        if (!calendars || calendars.length === 0) {
          // デフォルトカレンダーを作成
          const { data: newCalendar, error: createError } = await supabase
            .from("calendars")
            .insert({
              name: "マイカレンダー",
              owner_id: user.id,
              color: "#3B82F6",
            })
            .select()
            .single();

          if (createError) {
            console.error("カレンダー作成エラー:", createError);
            setIsLoading(false);
            return;
          }

          calendarId = newCalendar.id;
        } else {
          calendarId = calendars[0].id;
        }

        setDefaultCalendarId(calendarId);

        // イベントを取得
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("calendar_id", calendarId);

        if (eventsError) {
          console.error("イベント取得エラー:", eventsError);
          setIsLoading(false);
          return;
        }

        // データベースのイベントをFullCalendar形式に変換
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
  }, [supabase]);

  // イベントを追加
  const addEvent = async (formData: EventFormData) => {
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

      // 全日でない場合で複数日にまたがる場合は、各日に予定を複製
      if (!formData.allDay && daysDiff > 0) {
        const newEvents: Event[] = [];

        for (let i = 0; i <= daysDiff; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dateStr = currentDate.toISOString().split("T")[0];

          if (!user || !defaultCalendarId) {
            // ローカル保存
            const event: Event = {
              id: `${Date.now()}_${i}`,
              title: formData.title,
              start: `${dateStr}T${formData.startTime || "09:00"}:00`,
              end: `${dateStr}T${formData.endTime || "10:00"}:00`,
              allDay: false,
              color: "#3B82F6",
            };
            newEvents.push(event);
          } else {
            // データベースに保存
            const startTime = `${dateStr}T${formData.startTime || "09:00"}:00`;
            const endTime = `${dateStr}T${formData.endTime || "10:00"}:00`;

            const { data: eventData, error } = await supabase
              .from("events")
              .insert({
                calendar_id: defaultCalendarId,
                title: formData.title,
                start_time: startTime,
                end_time: endTime,
                is_all_day: false,
                color: "#3B82F6",
                created_by: user.id,
                description: formData.memo || null,
              })
              .select()
              .single();

            if (error) {
              console.error("イベント保存エラー:", error);
              continue;
            }

            newEvents.push({
              id: eventData.id,
              title: eventData.title,
              start: eventData.start_time,
              end: eventData.end_time,
              allDay: false,
              color: eventData.color || "#3B82F6",
            });
          }
        }

        setEvents([...events, ...newEvents]);
        return;
      }

      // 単一日または全日イベントの場合(従来の処理)
      if (!user || !defaultCalendarId) {
        const newEvent: Event = {
          id: String(Date.now()),
          title: formData.title,
          start: formData.allDay
            ? formData.startDate
            : `${formData.startDate}T${formData.startTime || "09:00"}:00`,
          end: formData.allDay
            ? (() => {
                // FullCalendar's all-day events require end date to be next day
                const endDate = new Date(
                  formData.endDate || formData.startDate
                );
                endDate.setDate(endDate.getDate() + 1);
                return endDate.toISOString().split("T")[0];
              })()
            : `${formData.endDate || formData.startDate}T${formData.endTime || "10:00"}:00`,
          allDay: formData.allDay,
          color: "#3B82F6",
        };

        setEvents([...events, newEvent]);
        return;
      }

      // データベースに保存
      const startTime = formData.allDay
        ? `${formData.startDate}T00:00:00`
        : `${formData.startDate}T${formData.startTime || "09:00"}:00`;
      const endTime = formData.allDay
        ? `${formData.endDate || formData.startDate}T23:59:59`
        : `${formData.endDate || formData.startDate}T${formData.endTime || "10:00"}:00`;

      const { data: newEventData, error } = await supabase
        .from("events")
        .insert({
          calendar_id: defaultCalendarId,
          title: formData.title,
          start_time: startTime,
          end_time: endTime,
          is_all_day: formData.allDay,
          color: "#3B82F6",
          created_by: user.id,
          description: formData.memo || null,
        })
        .select()
        .single();

      if (error) {
        console.error("イベント保存エラー:", error);
        throw new Error("予定の保存に失敗しました");
      }

      // 成功したら画面を更新
      const newEvent: Event = {
        id: newEventData.id,
        title: newEventData.title,
        start: newEventData.is_all_day
          ? newEventData.start_time.split("T")[0]
          : newEventData.start_time,
        end: newEventData.is_all_day
          ? (() => {
              // FullCalendarの全日イベントは終了日を翌日にする必要がある
              const endDate = new Date(newEventData.end_time.split("T")[0]);
              endDate.setDate(endDate.getDate() + 1);
              return endDate.toISOString().split("T")[0];
            })()
          : newEventData.end_time,
        allDay: newEventData.is_all_day,
        color: newEventData.color || "#3B82F6",
      };

      setEvents([...events, newEvent]);
    } catch (error) {
      console.error("予期しないエラー:", error);
      throw error;
    }
  };

  // イベントを削除
  const deleteEvent = async (eventId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && defaultCalendarId) {
        // データベースから削除
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId);

        if (error) {
          console.error("イベント削除エラー:", error);
          throw new Error("予定の削除に失敗しました");
        }
      }

      // ローカルの状態から削除
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error("予期しないエラー:", error);
      throw error;
    }
  };

  // イベントを更新（ドラッグ&ドロップ用）
  const updateEvent = async (
    eventId: string,
    newStartTime: string,
    newEndTime: string,
    isAllDay: boolean
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !defaultCalendarId) {
        // ローカルのみで更新
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

      // データベースを更新
      const { error } = await supabase
        .from("events")
        .update({
          start_time: newStartTime,
          end_time: newEndTime,
        })
        .eq("id", eventId);

      if (error) {
        console.error("イベント更新エラー:", error);
        throw new Error("予定の更新に失敗しました");
      }

      // 成功時、ローカルの状態も更新
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

  return {
    events,
    isLoading,
    addEvent,
    deleteEvent,
    updateEvent,
  };
}
