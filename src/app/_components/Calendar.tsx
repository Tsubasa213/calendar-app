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
  onAddEventReady?: (openAddEventModal: () => void) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  onCalendarReady,
  onAddEventReady,
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
  const [newEventStartDate, setNewEventStartDate] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndDate, setNewEventEndDate] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventAllDay, setNewEventAllDay] = useState(false);
  const [newEventGenre, setNewEventGenre] = useState("");
  const [newEventMemo, setNewEventMemo] = useState("");

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
          (event: DbEvent) => {
            // 全日イベントの場合は日付のみを使用（タイムゾーンの影響を避ける）
            if (event.is_all_day) {
              const startDate = event.start_time.split("T")[0];
              return {
                id: event.id,
                title: event.title,
                start: startDate,
                end: startDate,
                allDay: true,
                color: event.color || "#3B82F6",
              };
            } else {
              // 時間制イベントはそのまま使用
              return {
                id: event.id,
                title: event.title,
                start: event.start_time,
                end: event.end_time,
                allDay: false,
                color: event.color || "#3B82F6",
              };
            }
          }
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

  // goToToday関数を作成してContextに登録
  const registerGoToToday = () => {
    if (onCalendarReady && calendarRef.current) {
      const goToToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
          calendarApi.today();
        }
      };
      onCalendarReady(goToToday);
    }

    if (onAddEventReady) {
      const openAddEventModal = () => {
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];
        setSelectedDate(dateStr);
        setNewEventStartDate(dateStr);
        setNewEventEndDate(dateStr);
        setNewEventStartTime("09:00");
        setNewEventEndTime("10:00");
        setIsAddEventModalOpen(true);
      };
      onAddEventReady(openAddEventModal);
    }
  };

  if (!isClient) {
    return null;
  }

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setNewEventStartDate(arg.dateStr);
    setNewEventEndDate(arg.dateStr);
    setNewEventStartTime("09:00");
    setNewEventEndTime("10:00");
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    // イベントをクリックしたときも、その日付の予定表示画面を開く
    // 全日イベントの場合はstartStrを使用してタイムゾーンの影響を避ける
    const eventDate = arg.event.allDay
      ? arg.event.startStr
      : arg.event.start.toISOString().split("T")[0];
    setSelectedDate(eventDate);
    setIsModalOpen(true);
  };

  const handleEventDrop = async (info: any) => {
    // ドラッグ&ドロップでイベントの日付を変更
    const event = info.event;
    const oldEvent = info.oldEvent;
    const isAllDay = event.allDay;

    // 全日イベントの場合はstartStrを使用してタイムゾーンの影響を避ける
    const newDate = isAllDay
      ? event.startStr
      : event.start.toISOString().split("T")[0];

    let newStartTime: string;
    let newEndTime: string;

    if (isAllDay) {
      // 全日イベントの場合
      newStartTime = `${newDate}T00:00:00`;
      newEndTime = `${newDate}T23:59:59`;
    } else {
      // 時間制イベントの場合 - 時刻は保持したまま日付のみ変更
      const oldStart = oldEvent.start;
      const oldTime = oldStart.toTimeString().split(" ")[0];
      newStartTime = `${newDate}T${oldTime}`;

      const oldEnd = oldEvent.end || oldStart;
      const oldEndTime = oldEnd.toTimeString().split(" ")[0];
      newEndTime = `${newDate}T${oldEndTime}`;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !defaultCalendarId) {
        // ローカルのみで更新
        const updatedEvents = events.map((e) =>
          e.id === event.id
            ? {
                ...e,
                start: isAllDay ? newDate : newStartTime,
                end: isAllDay ? newDate : newEndTime,
              }
            : e
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
        .eq("id", event.id);

      if (error) {
        console.error("イベント更新エラー:", error);
        info.revert(); // エラー時は元に戻す
        alert("予定の更新に失敗しました");
        return;
      }

      // 成功時、ローカルの状態も更新
      const updatedEvents = events.map((e) =>
        e.id === event.id
          ? {
              ...e,
              start: isAllDay ? newDate : newStartTime,
              end: isAllDay ? newDate : newEndTime,
            }
          : e
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("予期しないエラー:", error);
      info.revert();
      alert("予定の更新に失敗しました");
    }
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => {
      const eventDate = event.start.split("T")[0];
      return eventDate === dateStr;
    });
  };

  const handleAddEvent = async () => {
    if (!newEventTitle || !newEventStartDate) return;

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
            ? newEventStartDate
            : `${newEventStartDate}T${newEventStartTime || "09:00"}:00`,
          end: newEventAllDay
            ? newEventEndDate || newEventStartDate
            : `${newEventEndDate || newEventStartDate}T${newEventEndTime || "10:00"}:00`,
          allDay: newEventAllDay,
          color: "#3B82F6",
        };

        setEvents([...events, newEvent]);
        setIsAddEventModalOpen(false);
        resetFormFields();
        return;
      }

      // データベースに保存
      const startTime = newEventAllDay
        ? `${newEventStartDate}T00:00:00`
        : `${newEventStartDate}T${newEventStartTime || "09:00"}:00`;
      const endTime = newEventAllDay
        ? `${newEventEndDate || newEventStartDate}T23:59:59`
        : `${newEventEndDate || newEventStartDate}T${newEventEndTime || "10:00"}:00`;

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
          description: newEventMemo || null,
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
        start: newEventData.is_all_day
          ? newEventData.start_time.split("T")[0]
          : newEventData.start_time,
        end: newEventData.is_all_day
          ? newEventData.end_time.split("T")[0]
          : newEventData.end_time,
        allDay: newEventData.is_all_day,
        color: newEventData.color || "#3B82F6",
      };

      setEvents([...events, newEvent]);
      setIsAddEventModalOpen(false);
      resetFormFields();
    } catch (error) {
      console.error("予期しないエラー:", error);
      alert("予定の追加に失敗しました");
    }
  };

  const resetFormFields = () => {
    setNewEventTitle("");
    setNewEventStartDate("");
    setNewEventStartTime("");
    setNewEventEndDate("");
    setNewEventEndTime("");
    setNewEventAllDay(false);
    setNewEventGenre("");
    setNewEventMemo("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const openAddEventModal = () => {
    setIsModalOpen(false);
    // 時間が設定されていなければデフォルト値を設定
    if (!newEventStartTime) setNewEventStartTime("09:00");
    if (!newEventEndTime) setNewEventEndTime("10:00");
    setIsAddEventModalOpen(true);
  };

  const closeAddEventModal = () => {
    setIsAddEventModalOpen(false);
    resetFormFields();
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
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              datesSet={registerGoToToday}
              editable={true}
              eventStartEditable={true}
              eventDurationEditable={false}
              eventResizableFromStart={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={4}
              weekends={true}
              height="100%"
              locale="ja"
              eventContent={(arg) => {
                const isAllDay = arg.event.allDay;
                const eventColor = arg.event.backgroundColor || "#3B82F6";

                if (isAllDay) {
                  // 全日イベントの表示 - コンパクトでスタイリッシュ
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: eventColor,
                        color: "white",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        fontSize: "0.65rem",
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "grab",
                        height: "18px",
                        lineHeight: "16px",
                      }}
                    >
                      <span
                        style={{
                          marginRight: "3px",
                          fontSize: "0.7rem",
                          lineHeight: "1",
                        }}
                      >
                        ●
                      </span>
                      <span>{arg.event.title}</span>
                    </div>
                  );
                } else {
                  // 時間制イベントの表示 - 背景なし、左ボーダーのみ
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "transparent",
                        color: "#1f2937",
                        padding: "1px 0 1px 4px",
                        borderRadius: "2px",
                        fontSize: "0.65rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "grab",
                        borderLeft: `3px solid ${eventColor}`,
                        height: "18px",
                        lineHeight: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          color: eventColor,
                          marginRight: "4px",
                        }}
                      >
                        {arg.timeText}
                      </span>
                      <span style={{ fontWeight: "500" }}>
                        {arg.event.title}
                      </span>
                    </div>
                  );
                }
              }}
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
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
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

              {/* 開始日時 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  開始日時
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newEventStartDate}
                    onChange={(e) => setNewEventStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {!newEventAllDay && (
                    <input
                      type="time"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* 終了日時 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  終了日時
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newEventEndDate}
                    onChange={(e) => setNewEventEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {!newEventAllDay && (
                    <input
                      type="time"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* ジャンル選択 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  予定のジャンル
                </label>
                <select
                  value={newEventGenre}
                  onChange={(e) => setNewEventGenre(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="work">仕事</option>
                  <option value="personal">プライベート</option>
                  <option value="meeting">会議</option>
                  <option value="event">イベント</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* メモ */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  メモ
                </label>
                <textarea
                  value={newEventMemo}
                  onChange={(e) => setNewEventMemo(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="詳細や備考を入力"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeAddEventModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle || !newEventStartDate}
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
