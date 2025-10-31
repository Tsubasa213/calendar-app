"use client";
import { useState } from "react";
import { CalendarWithMembers } from "@/types/calendar.types";
import { EventType, EVENT_TYPE_COLORS } from "@/types/event.types";
import EventTypeManager from "./EventTypeManager";

interface EditCalendarModalProps {
  isOpen: boolean;
  calendar: CalendarWithMembers;
  eventTypes: EventType[];
  onChangeEventTypes: (types: EventType[]) => void;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    icon: string;
    eventTypes: EventType[];
  }) => void;
}

const CALENDAR_ICONS = [
  "📅",
  "📆",
  "🗓️",
  "📝",
  "✨",
  "🎯",
  "💼",
  "🏠",
  "🎓",
  "💪",
  "🧑‍💻",
  "👨‍👩‍👧‍👦",
  "🏢",
  "🏫",
  "🏥",
  "🏀",
  "🎸",
  "🎮",
  "🍀",
  "🌸",
  "🌞",
  "🌙",
  "⭐",
  "⚡",
  "🔥",
  "🍎",
  "🍕",
  "🚗",
  "✈️",
  "❤️",
];

export default function EditCalendarModal({
  isOpen,
  calendar,
  eventTypes,
  onChangeEventTypes,
  onClose,
  onSave,
}: EditCalendarModalProps) {
  const [name, setName] = useState(calendar.name);
  const [description, setDescription] = useState(calendar.description || "");
  const [icon, setIcon] = useState(calendar.icon || "📅");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            カレンダー設定
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ name, description, icon, eventTypes });
          }}
        >
          <div className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                カレンダー名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                アイコン
              </label>
              <div className="grid max-h-32 grid-cols-5 gap-2 overflow-y-auto rounded border bg-white p-2 shadow">
                {CALENDAR_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`rounded-lg border-2 p-3 text-2xl transition-colors ${icon === ic ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <EventTypeManager
              eventTypes={eventTypes}
              onChange={onChangeEventTypes}
            />
          </div>
          <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
