"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type Event = {
  id: number;
  date: string;
  title: string;
};

const CalendarComponent: React.FC = () => {
  const [date, setDate] = useState<Value>(new Date());
  const [events, setEvents] = useState<Event[]>([
    { id: 1, date: "2025-04-02", title: "会議" },
    { id: 2, date: "2025-04-05", title: "ランチ" },
  ]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const selectedDate =
    date instanceof Date ? date.toISOString().split("T")[0] : "";

  const filteredEvents = events.filter((event) => event.date === selectedDate);

  return (
    <div className="flex w-full items-center justify-center overflow-hidden bg-gray-100 p-2 sm:p-3 md:p-4">
      <div className="mx-auto flex h-auto w-full flex-col rounded-lg bg-white p-2 text-center shadow-md sm:p-3 md:p-4 lg:p-6 xl:max-w-4xl">
        <h2 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg md:mb-4 md:text-xl">
          カレンダー
        </h2>

        {/* カレンダー部分 - デバイスサイズに応じて最適化 */}
        <div className="flex w-full justify-center">
          <div className="mx-auto w-full">
            <Calendar
              onChange={setDate}
              value={date}
              calendarType="gregory" // 日曜始まりのグレゴリオ暦を明示的に指定
              tileContent={({ date, view }) => {
                if (view !== "month") return null;
                const eventForDate = events.find(
                  (event) => event.date === date.toISOString().split("T")[0]
                );
                return (
                  <div className="calendar-tile-content">
                    {eventForDate && (
                      <p className="mt-1 text-xs text-blue-500 sm:text-sm">
                        {eventForDate.title}
                      </p>
                    )}
                  </div>
                );
              }}
              className="custom-calendar mx-auto w-full rounded-md border"
              tileClassName={({ date, view }) => {
                if (view !== "month") return "";
                return "h-14 sm:h-20 md:h-24 lg:h-20 flex flex-col calendar-tile";
              }}
            />
          </div>
        </div>

        {/* 選択日付と予定一覧部分 - PCのみ表示 */}
        <div className="mx-auto mt-4 hidden w-full md:block">
          <p className="mb-2 text-center text-sm md:text-base lg:text-base">
            選択した日付:{" "}
            {date instanceof Date ? date.toDateString() : "未選択"}
          </p>

          <div className="max-h-32 overflow-auto rounded-md bg-gray-100 p-3 md:max-h-40 lg:max-h-36">
            <h3 className="text-sm font-bold md:text-base">予定一覧</h3>
            {filteredEvents.length > 0 ? (
              <ul className="mt-1 text-sm text-gray-700">
                {filteredEvents.map((event) => (
                  <li key={event.id} className="mt-1 md:mt-2">
                    • {event.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                この日に予定はありません。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
