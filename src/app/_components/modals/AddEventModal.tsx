import React, { useState } from "react";
import { EventFormData, EventType } from "@/types/event.types";

interface AddEventModalProps {
  isOpen: boolean;
  formData: EventFormData;
  eventTypes: EventType[];
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (updates: Partial<EventFormData>) => void;
}

// 時間選択用のオプションを生成（30分刻み）
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      options.push(timeStr);
    }
  }
  return options;
};

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  formData,
  eventTypes,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  if (!isOpen) return null;

  const timeOptions = generateTimeOptions();

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate) return;
    onSubmit();
  };

  const isEditing = !!formData.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 sm:p-8">
      {/* モーダルサイズ: 適度な余白を持たせて表示 */}
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold sm:text-2xl">
            {isEditing ? "予定を編集" : "予定を追加"}
          </h3>
          <button
            onClick={onClose}
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

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              予定のタイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onFormChange({ title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 会議、ランチなど"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => onFormChange({ allDay: e.target.checked })}
              className="size-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="allDay"
              className="text-sm font-medium text-gray-700"
            >
              終日
            </label>
          </div>

          {/* 開始日時 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              開始日時
            </label>
            <div className="flex flex-col gap-3">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormChange({ startDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!formData.allDay && (
                <select
                  value={formData.startTime}
                  onChange={(e) => onFormChange({ startTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 終了日時 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              終了日時
            </label>
            <div className="flex flex-col gap-3">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormChange({ endDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!formData.allDay && (
                <select
                  value={formData.endTime}
                  onChange={(e) => onFormChange({ endTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ジャンル選択 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              予定のジャンル
            </label>
            {eventTypes.length > 0 ? (
              <select
                value={formData.genre}
                onChange={(e) => onFormChange({ genre: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                カレンダー設定でジャンルを作成してください
              </div>
            )}
          </div>

          {/* --- ▼ 修正点: プレビューエリアに固定の高さ(h-14)を設定 ▼ --- */}
          <div className="min-h-[3.5rem]">
            {/* 選択されたジャンルのプレビュー */}
            {formData.genre && eventTypes.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 text-xs font-medium text-gray-600">
                  選択中のジャンル:
                </div>
                {(() => {
                  const selectedType = eventTypes.find(
                    (t) => t.id === formData.genre
                  );
                  return selectedType ? (
                    <div
                      className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-white"
                      style={{ backgroundColor: selectedType.color }}
                    >
                      {selectedType.name}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
          {/* --- ▲ 修正点 ▲ --- */}

          {/* メモ */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              メモ
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => onFormChange({ memo: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="詳細や備考を入力"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.startDate}
              className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? "保存" : "追加"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
