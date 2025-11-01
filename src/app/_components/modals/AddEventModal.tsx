import React from "react";
import { EventFormData, EventType } from "@/types/event.types";

interface AddEventModalProps {
  isOpen: boolean;
  formData: EventFormData;
  eventTypes: EventType[];
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (updates: Partial<EventFormData>) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  formData,
  eventTypes,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate) return;
    onSubmit();
  };

  const isEditing = !!formData.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* モーダルサイズ: 横3(max-w-md = 28rem = 448px)、縦5(max-h-[70vh]) */}
      <div className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold sm:text-xl">
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

        <div className="space-y-4">
          {/* ... (タイトル, 終日, 開始/終了日時 フォームは変更なし) ... */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              予定のタイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onFormChange({ title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="例: 会議、ランチなど"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => onFormChange({ allDay: e.target.checked })}
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormChange({ startDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {!formData.allDay && (
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => onFormChange({ startTime: e.target.value })}
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormChange({ endDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {!formData.allDay && (
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => onFormChange({ endTime: e.target.value })}
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
            {eventTypes.length > 0 ? (
              <select
                value={formData.genre}
                onChange={(e) => onFormChange({ genre: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                カレンダー設定でジャンルを作成してください
              </div>
            )}
          </div>

          {/* --- ▼ 修正点: プレビューエリアに固定の高さ(h-14)を設定 ▼ --- */}
          <div className="h-14">
            {/* 選択されたジャンルのプレビュー */}
            {formData.genre && eventTypes.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="mb-1 text-xs font-medium text-gray-600">
                  選択中のジャンル:
                </div>
                {(() => {
                  const selectedType = eventTypes.find(
                    (t) => t.id === formData.genre
                  );
                  return selectedType ? (
                    <div
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-white"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              メモ
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => onFormChange({ memo: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="詳細や備考を入力"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.startDate}
              className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? "保存" : "追加"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
