"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import "./Calendar.css";

type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
};

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleDateClick = (arg: any) => {
    alert(`日付がクリックされました: ${arg.dateStr}`);
  };

  const handleEventClick = (arg: any) => {
    alert(`イベント: ${arg.event.title}`);
  };

  return (
    <div className="flex size-full items-center justify-center bg-gray-100 p-2 sm:p-3 md:p-4">
      <div className="flex size-full max-w-3xl flex-col rounded-lg bg-white p-2 shadow-md sm:p-3 md:p-4">
        <h2 className="mb-2 text-center text-lg font-semibold sm:mb-3 sm:text-xl md:text-2xl">
          カレンダー
        </h2>

        <div className="fullcalendar-container flex-1">
          <FullCalendar
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
      </div>
    </div>
  );
};

export default CalendarComponent;
