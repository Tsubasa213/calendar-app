"use client";

import { useState, useEffect } from "react";
import {
  getUserCalendars,
  getCalendarStats,
} from "@/lib/queries/calendarQueries";
import type {
  CalendarWithMembers,
  CalendarStats,
} from "@/types/calendar.types";

interface CalendarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCalendarId?: string;
  onSelectCalendar: (calendarId: string) => void;
}

export default function CalendarSelectorModal({
  isOpen,
  onClose,
  currentCalendarId,
  onSelectCalendar,
}: CalendarSelectorModalProps) {
  const [calendars, setCalendars] = useState<CalendarWithMembers[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCalendars();
    }
  }, [isOpen]);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const [calendarsData, statsData] = await Promise.all([
        getUserCalendars(),
        getCalendarStats(),
      ]);
      setCalendars(calendarsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCalendar = (calendarId: string) => {
    onSelectCalendar(calendarId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                カレンダー選択
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
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
            {stats && (
              <div className="mt-4 text-sm text-gray-600">
                <p>作成済み: {stats.owned_calendars}/2</p>
                <p>参加中: {stats.participated_calendars}/3</p>
              </div>
            )}
          </div>

          <div className="max-h-[calc(80vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : calendars.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>カレンダーがありません</p>
                <p className="mt-2 text-sm">
                  新しいカレンダーを作成してください
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {calendars.map((calendar) => (
                  <div
                    key={calendar.id}
                    className={`p-4 transition-colors hover:bg-gray-50 ${
                      currentCalendarId === calendar.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSelectCalendar(calendar.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {calendar.icon || "📅"}
                          </span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {calendar.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              メンバー: {calendar.member_count}/8
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                    {calendar.description && (
                      <p className="ml-11 mt-2 text-sm text-gray-600">
                        {calendar.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
