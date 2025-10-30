"use client";

import { useState } from "react";
import { createCalendar } from "@/lib/queries/calendarQueries";
import type { CreateCalendarInput } from "@/types/calendar.types";

interface CreateCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


const CALENDAR_ICONS = [
  "📅", "📆", "🗓️", "📝", "✨", "🎯", "💼", "🏠", "🎓", "💪",
  "🧑‍💻", "👨‍👩‍👧‍👦", "🏢", "🏫", "🏥", "🏀", "🎸", "🎮", "🍀", "🌸",
  "🌞", "🌙", "⭐", "⚡", "🔥", "🍎", "🍕", "🚗", "✈️", "📚", "♡"
];

export default function CreateCalendarModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCalendarModalProps) {
  const [formData, setFormData] = useState<CreateCalendarInput>({
    name: "",
    description: "",
    icon: "📅",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [iconOpen, setIconOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("カレンダー名を入力してください");
      return;
    }

    try {
      setLoading(true);
      await createCalendar(formData);
      onSuccess();
      // Reset form
      setFormData({
        name: "",
        description: "",
        icon: "📅",
      });
    } catch (err: any) {
      setError(err.message || "カレンダーの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              新しいカレンダーを作成
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
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                カレンダー名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="例: チームカレンダー"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                説明（任意）
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="カレンダーの説明を入力"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                アイコン
              </label>
              <button
                type="button"
                className="mb-2 flex items-center gap-2 rounded border px-3 py-2 text-base text-gray-700 bg-gray-50 hover:bg-gray-100"
                onClick={() => setIconOpen((v) => !v)}
                aria-expanded={iconOpen}
              >
                <span className="text-2xl">{formData.icon}</span>
                <span>アイコンを選択</span>
                <svg className={`ml-1 size-4 transition-transform ${iconOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>
              {iconOpen && (
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto border rounded bg-white p-2 shadow">
                  {CALENDAR_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => { setFormData({ ...formData, icon }); setIconOpen(false); }}
                      className={`rounded-lg border-2 p-3 text-2xl transition-colors ${
                        formData.icon === icon
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* カラー選択は削除 */}
          </div>

          <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
