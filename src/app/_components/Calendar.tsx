"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "./Calendar.css";
// 1. DbEvent と Event (FullCalendar用) をインポート
import {
  CalendarComponentProps,
  EventFormData,
  Event,
  DbEvent,
} from "@/types/event.types";
import { useEvents } from "./hooks/useEvents";
import { useCalendar as useCalendarHook } from "./hooks/useCalendar";
import { EventModal } from "./modals/EventModal";
import { AddEventModal } from "./modals/AddEventModal";
import { calculateNewEventTimes } from "@/lib/utils/eventUtils";
import { getTodayString } from "@/lib/utils/dateUtils";
import { createClient } from "@/lib/supabase/client"; // 2. Supabaseクライアントをインポート

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  onCalendarReady,
  onAddEventReady,
  eventTypes,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [defaultStartTime, setDefaultStartTime] = useState("09:00");
  const [defaultEndTime, setDefaultEndTime] = useState("10:00");
  const [weekStartsOn, setWeekStartsOn] = useState(0);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    genre: "",
    memo: "",
  });

  const {
    events,
    isLoading,
    addEvent,
    deleteEvent,
    updateEventTime, // 3. リネームされた関数
    updateEventDetails, // 4. 新しい関数
  } = useEvents(eventTypes);

  const supabase = createClient(); // 5. Supabaseクライアントを初期化

  useEffect(() => {
    setIsClient(true);
    const savedSettings = localStorage.getItem("calendarSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDefaultStartTime(settings.defaultStartTime || "09:00");
      setDefaultEndTime(settings.defaultEndTime || "10:00");
      setWeekStartsOn(parseInt(settings.weekStartsOn) || 0);
    }
  }, []);

  const openAddEventModalWithDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setFormData({
      // 6. resetFormFields を使う
      id: undefined, // idをクリア
      title: "",
      startDate: dateStr,
      startTime: defaultStartTime,
      endDate: dateStr,
      endTime: defaultEndTime,
      allDay: false,
      genre: "",
      memo: "",
    });
    setIsAddEventModalOpen(true);
  };

  const openAddEventModalDefault = () => {
    const today = getTodayString();
    openAddEventModalWithDate(today);
  };

  const { calendarRef, registerGoToToday } = useCalendarHook(
    onCalendarReady,
    onAddEventReady,
    openAddEventModalDefault
  );

  if (!isClient) {
    return null;
  }

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setFormData({
      ...formData,
      id: undefined, // 7. 新規作成なのでidをクリア
      startDate: arg.dateStr,
      endDate: arg.dateStr,
      allDay: false,
    });
    setIsAddEventModalOpen(false);
    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    const startDate = selectInfo.startStr;
    const endDateObj = new Date(selectInfo.endStr || selectInfo.end);
    endDateObj.setDate(endDateObj.getDate() - 1);
    const endDateStr = endDateObj.toISOString().split("T")[0];

    if (startDate === endDateStr) {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();
      return;
    }

    setSelectedDate(startDate);
    setFormData({
      ...formData,
      id: undefined, // 8. 新規作成なのでidをクリア
      startDate,
      endDate: endDateStr,
      allDay: true,
    });
    setIsAddEventModalOpen(true);

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleEventClick = (arg: any) => {
    const eventDate = arg.event.allDay
      ? arg.event.startStr
      : arg.event.start.toISOString().split("T")[0];
    setSelectedDate(eventDate);
    setIsModalOpen(true);
  };

  const handleEventDrop = async (info: any) => {
    const event = info.event;
    const isAllDay = event.allDay;

    try {
      const { newStartTime, newEndTime } = calculateNewEventTimes(
        event,
        isAllDay
      );
      // 9. リネームした `updateEventTime` を使用
      await updateEventTime(event.id, newStartTime, newEndTime, isAllDay);
    } catch (error) {
      console.error("予期しないエラー:", error);
      info.revert();
      // アラートはしない
    }
  };

  // 10. `handleAddEvent` を `handleSaveEvent` に変更
  const handleSaveEvent = async () => {
    try {
      if (formData.id) {
        // IDがある場合は「更新」
        await updateEventDetails(formData);
      } else {
        // IDがない場合は「新規追加」
        await addEvent(formData);
      }
      setIsAddEventModalOpen(false);
      resetFormFields();
    } catch (error) {
      console.error("保存/更新エラー:", error);
      // アラートはしない
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error("削除エラー:", error);
      // アラートはしない
    }
  };

  const resetFormFields = () => {
    setFormData({
      id: undefined, // idもクリア
      title: "",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      allDay: false,
      genre: "",
      memo: "",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const openAddEventModalFromEventModal = () => {
    setIsModalOpen(false);
    // フォームデータは selectedDate に基づいて設定する
    // resetFormFieldsを呼んでから日付を設定
    resetFormFields();
    setFormData((prev) => ({
      ...prev,
      startDate: selectedDate || getTodayString(),
      endDate: selectedDate || getTodayString(),
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    }));
    setIsAddEventModalOpen(true);
  };

  // 11. 編集モーダルを開くための新しい関数
  const handleOpenEditModal = async (event: Event) => {
    setIsModalOpen(false); // まず日付モーダルを閉じる

    try {
      // DBから完全なイベントデータを取得 (memoやgenre IDのため)
      const { data: dbEvent, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", event.id)
        .single();

      if (error || !dbEvent) {
        throw error || new Error("イベントが見つかりません");
      }

      // DBデータを EventFormData 形式に変換
      const [startDate, startTimeFull] = dbEvent.start_time.split("T");
      const [endDate, endTimeFull] = dbEvent.end_time.split("T");

      // eventTypes から color に一致する genre (id) を見つける
      const selectedGenre = eventTypes.find((t) => t.color === dbEvent.color);

      setFormData({
        id: dbEvent.id,
        title: dbEvent.title,
        allDay: dbEvent.is_all_day,
        startDate: startDate,
        startTime: startTimeFull ? startTimeFull.substring(0, 5) : "00:00",
        endDate: dbEvent.is_all_day ? endDate : startDate, // 全日でない場合は開始日と同じ（複数日対応は後で）
        endTime: endTimeFull ? endTimeFull.substring(0, 5) : "00:00",
        genre: selectedGenre ? selectedGenre.id : "",
        memo: dbEvent.description || "",
      });

      // 編集モーダルを開く
      setIsAddEventModalOpen(true);
    } catch (error) {
      console.error("イベントの読み込みに失敗しました:", error);
      // アラートはしない
    }
  };

  const closeAddEventModal = () => {
    setIsAddEventModalOpen(false);
    resetFormFields();
  };

  const handleFormChange = (updates: Partial<EventFormData>) => {
    setFormData({ ...formData, ...updates });
  };

  return (
    <div className="flex size-full items-center justify-center bg-gray-100 p-2 sm:p-3 md:p-4 lg:pl-3">
      <div className="flex size-full max-w-5xl flex-col rounded-lg bg-white p-2 shadow-md sm:p-3 md:p-4">
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
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              datesSet={registerGoToToday}
              editable={true}
              eventStartEditable={true}
              eventDurationEditable={false}
              eventResizableFromStart={false}
              selectable={false}
              selectMirror={false}
              dayMaxEvents={false}
              dayMaxEventRows={4}
              weekends={true}
              height="100%"
              locale="ja"
              timeZone="local"
              fixedWeekCount={true}
              showNonCurrentDates={true}
              dragScroll={true}
              eventOverlap={true}
              droppable={true}
              snapDuration="00:15:00"
              dragRevertDuration={200}
              longPressDelay={100}
              eventLongPressDelay={100}
              selectLongPressDelay={100}
              firstDay={weekStartsOn}
              eventContent={(arg) => {
                const isAllDay = arg.event.allDay;
                const eventColor = arg.event.backgroundColor || "#3B82F6";

                const hexToRgba = (hex: string, alpha: number) => {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                if (isAllDay) {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: hexToRgba(eventColor, 0.1),
                        border: `1px solid ${hexToRgba(eventColor, 0.3)}`,
                        color: eventColor,
                        padding: "1px 4px",
                        borderRadius: "3px",
                        fontSize: "0.65rem",
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        height: "18px",
                        lineHeight: "16px",
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          marginRight: "3px",
                          fontSize: "0.7rem",
                          lineHeight: "1",
                          pointerEvents: "none",
                        }}
                      >
                        ●
                      </span>
                      <span style={{ pointerEvents: "none" }}>
                        {arg.event.title}
                      </span>
                    </div>
                  );
                } else {
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
                        borderLeft: `3px solid ${eventColor}`,
                        height: "18px",
                        lineHeight: "16px",
                        width: "100%",
                      }}
                    >
                      <span
                        style={{ fontWeight: "500", pointerEvents: "none" }}
                      >
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

      <EventModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        events={events}
        onClose={closeModal}
        onAddEvent={openAddEventModalFromEventModal}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleOpenEditModal} // 12. 新しいpropを渡す
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        formData={formData}
        eventTypes={eventTypes}
        onClose={closeAddEventModal}
        onSubmit={handleSaveEvent} // 13. `handleSaveEvent` を渡す
        onFormChange={handleFormChange}
      />
    </div>
  );
};

export default CalendarComponent;
