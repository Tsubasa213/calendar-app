"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "./Calendar.css";
import { CalendarComponentProps, EventFormData } from "@/types/event.types";
import { useEvents } from "./hooks/useEvents";
import { useCalendar as useCalendarHook } from "./hooks/useCalendar";
import { EventModal } from "./EventModal";
import { AddEventModal } from "./AddEventModal";
import { calculateNewEventTimes } from "@/lib/utils/eventUtils";
import { getTodayString } from "@/lib/utils/dateUtils";

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

  const { events, isLoading, addEvent, deleteEvent, updateEvent } = useEvents();

  useEffect(() => {
    setIsClient(true);

    // ローカルストレージから設定を読み込み
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
      startDate: arg.dateStr,
      endDate: arg.dateStr,
      allDay: false,
    });
    setIsAddEventModalOpen(false);
    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    const startDate = selectInfo.startStr;
    // FullCalendarのendは排他的（選択範囲の次の日）なので、1日引く
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

    console.log("=== Event Drop Debug ===");
    console.log("Event ID:", event.id);
    console.log("Is All Day:", isAllDay);

    try {
      const { newStartTime, newEndTime } = calculateNewEventTimes(
        event,
        isAllDay
      );

      console.log("New start time:", newStartTime);
      console.log("New end time:", newEndTime);

      await updateEvent(event.id, newStartTime, newEndTime, isAllDay);
    } catch (error) {
      console.error("予期しないエラー:", error);
      info.revert();
      alert("予定の更新に失敗しました");
    }
  };

  const handleAddEvent = async () => {
    try {
      await addEvent(formData);
      setIsAddEventModalOpen(false);
      resetFormFields();
    } catch (error) {
      alert("予定の追加に失敗しました");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      alert("予定の削除に失敗しました");
    }
  };

  const resetFormFields = () => {
    setFormData({
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
    if (!formData.startTime) {
      setFormData({ ...formData, startTime: "09:00" });
    }
    if (!formData.endTime) {
      setFormData({ ...formData, endTime: "10:00" });
    }
    setIsAddEventModalOpen(true);
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
              selectable={true}
              selectMirror={true}
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

                // HEXカラーをRGBAに変換する関数
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
                        backgroundColor: hexToRgba(eventColor, 0.1), // 10% opacity
                        border: `1px solid ${hexToRgba(eventColor, 0.3)}`, // 30% opacity
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
                        style={{
                          fontWeight: "700",
                          color: eventColor,
                          marginRight: "4px",
                          pointerEvents: "none",
                        }}
                      >
                        {arg.timeText}
                      </span>
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
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        formData={formData}
        eventTypes={eventTypes}
        onClose={closeAddEventModal}
        onSubmit={handleAddEvent}
        onFormChange={handleFormChange}
      />
    </div>
  );
};

export default CalendarComponent;
