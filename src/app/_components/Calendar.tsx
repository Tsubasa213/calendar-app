"use client";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "./Calendar.css";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
};

type DbEvent = Database["public"]["Tables"]["events"]["Row"];

interface CalendarComponentProps {
  onCalendarReady?: (goToToday: () => void) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  onCalendarReady,
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultCalendarId, setDefaultCalendarId] = useState<string | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventAllDay, setNewEventAllDay] = useState(false);

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
          (event: DbEvent) => ({
            id: event.id,
            title: event.title,
            start: event.start_time,
            end: event.end_time,
            allDay: event.is_all_day,
            color: event.color || "#3B82F6",
          })
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && calendarRef.current && onCalendarReady) {
      const goToToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          calendarApi.today();
        }
      };
      onCalendarReady(goToToday);
    }
  }, [isClient, onCalendarReady]);

  if (!isClient) {
    return null;
  }

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  // const handleEventClick = (arg: any) => {
  //   alert(`イベント: ${arg.event.title}`);
  // };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => {
      const eventDate = event.start.split("T")[0];
      return eventDate === dateStr;
    });
  };

  const handleAddEvent = async () => {
    if (!selectedDate || !newEventTitle) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ユーザーがログインしていない場合はローカルのみに保存
      if (!user || !defaultCalendarId) {
        const newEvent: Event = {
          id: String(Date.now()),
          title: newEventTitle,
          start: newEventAllDay
            ? selectedDate
            : `${selectedDate}T${newEventStartTime || "09:00"}:00`,
          end: newEventAllDay
            ? selectedDate
            : `${selectedDate}T${newEventEndTime || "10:00"}:00`,
          allDay: newEventAllDay,
          color: "#3B82F6",
        };

        setEvents([...events, newEvent]);
        setIsAddEventModalOpen(false);
        setNewEventTitle("");
        setNewEventStartTime("");
        setNewEventEndTime("");
        setNewEventAllDay(false);
        return;
      }

      // データベースに保存
      const startTime = newEventAllDay
        ? `${selectedDate}T00:00:00`
        : `${selectedDate}T${newEventStartTime || "09:00"}:00`;
      const endTime = newEventAllDay
        ? `${selectedDate}T23:59:59`
        : `${selectedDate}T${newEventEndTime || "10:00"}:00`;

      const { data: newEventData, error } = await supabase
        .from("events")
        .insert({
          calendar_id: defaultCalendarId,
          title: newEventTitle,
          start_time: startTime,
          end_time: endTime,
          is_all_day: newEventAllDay,
          color: "#3B82F6",
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("イベント保存エラー:", error);
        alert("予定の保存に失敗しました");
        return;
      }

      // 成功したら画面を更新
      const newEvent: Event = {
        id: newEventData.id,
        title: newEventData.title,
        start: newEventData.start_time,
        end: newEventData.end_time,
        allDay: newEventData.is_all_day,
        color: newEventData.color || "#3B82F6",
      };

      setEvents([...events, newEvent]);
      setIsAddEventModalOpen(false);
      setNewEventTitle("");
      setNewEventStartTime("");
      setNewEventEndTime("");
      setNewEventAllDay(false);
    } catch (error) {
      console.error("予期しないエラー:", error);
      alert("予定の追加に失敗しました");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const openAddEventModal = () => {
    setIsAddEventModalOpen(true);
  };

  const closeAddEventModal = () => {
    setIsAddEventModalOpen(false);
    setNewEventTitle("");
    setNewEventStartTime("");
    setNewEventEndTime("");
    setNewEventAllDay(false);
  };

  return (
    <div className="flex size-full items-center justify-center bg-gray-100 p-2 sm:p-3 md:p-4">
      <div className="flex size-full max-w-3xl flex-col rounded-lg bg-white p-2 shadow-md sm:p-3 md:p-4">
        <h2 className="mb-2 text-center text-lg font-semibold sm:mb-3 sm:text-xl md:text-2xl">
          カレンダー
        </h2>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-2 inline-block size-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="fullcalendar-container flex-1">
            <FullCalendar
              ref={calendarRef}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev",
                center: "title",
                right: "next",
              }}
              events={events}
              dateClick={handleDateClick}
              // eventClick={handleEventClick}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={2}
              weekends={true}
              height="100%"
              locale="ja"
              buttonText={{
                today: "今日",
                month: "月",
                week: "週",
                day: "日",
                list: "リスト",
              }}
              allDayText="終日"
              moreLinkText="+{0}"
              noEventsText="表示するイベントがありません"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              dayCellContent={(arg) => {
                return arg.dayNumberText.replace("日", "");
              }}
            />
          </div>
        )}
      </div>

      {/* 日付詳細モーダル */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "ja-JP",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  }
                )}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4 max-h-96 overflow-y-auto">
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border-l-4 bg-gray-50 p-3"
                      style={{ borderColor: event.color || "#3B82F6" }}
                    >
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.allDay
                          ? "終日"
                          : `${new Date(event.start).toLocaleTimeString(
                              "ja-JP",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )} - ${
                              event.end
                                ? new Date(event.end).toLocaleTimeString(
                                    "ja-JP",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : ""
                            }`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">
                  この日の予定はありません
                </p>
              )}
            </div>

            <button
              onClick={openAddEventModal}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              予定を追加
            </button>
          </div>
        </div>
      )}

      {/* 予定追加モーダル */}
      {isAddEventModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">予定を追加</h3>
              <button
                onClick={closeAddEventModal}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  予定のタイトル
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="例: 会議、ランチなど"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEventAllDay}
                  onChange={(e) => setNewEventAllDay(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="allDay" className="text-sm font-medium">
                  終日
                </label>
              </div>

              {!newEventAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      開始時刻
                    </label>
                    <input
                      type="time"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      終了時刻
                    </label>
                    <input
                      type="time"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeAddEventModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
