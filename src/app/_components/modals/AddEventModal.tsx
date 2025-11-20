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

// 年のオプションを生成
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear - 5; i <= currentYear + 10; i++) {
    years.push(i);
  }
  return years;
};

// 月のオプション
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

// 日のオプションを生成
const generateDayOptions = (year: number, month: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
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
  const yearOptions = generateYearOptions();

  // 開始日を年月日に分解
  const startDateParts = formData.startDate.split("-");
  const startYear = startDateParts[0]
    ? parseInt(startDateParts[0])
    : new Date().getFullYear();
  const startMonth = startDateParts[1]
    ? parseInt(startDateParts[1])
    : new Date().getMonth() + 1;
  const startDay = startDateParts[2]
    ? parseInt(startDateParts[2])
    : new Date().getDate();

  // 終了日を年月日に分解
  const endDateParts = formData.endDate.split("-");
  const endYear = endDateParts[0]
    ? parseInt(endDateParts[0])
    : new Date().getFullYear();
  const endMonth = endDateParts[1]
    ? parseInt(endDateParts[1])
    : new Date().getMonth() + 1;
  const endDay = endDateParts[2]
    ? parseInt(endDateParts[2])
    : new Date().getDate();

  const startDayOptions = generateDayOptions(startYear, startMonth);
  const endDayOptions = generateDayOptions(endYear, endMonth);

  // 日付変更ハンドラー
  const handleStartDateChange = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onFormChange({ startDate: dateStr });
  };

  const handleEndDateChange = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onFormChange({ endDate: dateStr });
  };

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
              {/* 年月日選択 */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={startYear}
                  onChange={(e) =>
                    handleStartDateChange(
                      parseInt(e.target.value),
                      startMonth,
                      startDay
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
                <select
                  value={startMonth}
                  onChange={(e) =>
                    handleStartDateChange(
                      startYear,
                      parseInt(e.target.value),
                      startDay
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}月
                    </option>
                  ))}
                </select>
                <select
                  value={startDay}
                  onChange={(e) =>
                    handleStartDateChange(
                      startYear,
                      startMonth,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {startDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}日
                    </option>
                  ))}
                </select>
              </div>
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
              {/* 年月日選択 */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={endYear}
                  onChange={(e) =>
                    handleEndDateChange(
                      parseInt(e.target.value),
                      endMonth,
                      endDay
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
                <select
                  value={endMonth}
                  onChange={(e) =>
                    handleEndDateChange(
                      endYear,
                      parseInt(e.target.value),
                      endDay
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}月
                    </option>
                  ))}
                </select>
                <select
                  value={endDay}
                  onChange={(e) =>
                    handleEndDateChange(
                      endYear,
                      endMonth,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-2 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {endDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}日
                    </option>
                  ))}
                </select>
              </div>
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
