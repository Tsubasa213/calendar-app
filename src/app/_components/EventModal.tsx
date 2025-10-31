import React, { useState } from "react";
import { Event } from "@/types/event.types";
import { getEventsForDate } from "@/lib/utils/eventUtils";
import { formatDateForDisplay, formatTime } from "@/lib/utils/dateUtils";

interface EventModalProps {
  isOpen: boolean;
  selectedDate: string | null;
  events: Event[];
  onClose: () => void;
  onAddEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void; // 1. 編集用プロパティを追加
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onDeleteEvent,
  onEditEvent, // 2. プロパティを受け取る
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen || !selectedDate) return null;

  const eventsForDate = getEventsForDate(events, selectedDate);

  const handleDeleteClick = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation(); // 3. 親ボタンのクリックイベントを防ぐ
    setDeleteConfirmId(eventId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteEvent(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {formatDateForDisplay(selectedDate)}
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

        <div className="mb-4 max-h-96 overflow-y-auto">
          {eventsForDate.length > 0 ? (
            <div className="space-y-3">
              {eventsForDate.map((event) => (
                // 4. div を button に変更し、onClick を設定
                <button
                  key={event.id}
                  onClick={() => onEditEvent(event)}
                  className="w-full rounded-lg border-l-4 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
                  style={{ borderColor: event.color || "#3B82F6" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.allDay
                          ? "終日"
                          : `${formatTime(event.start)} - ${
                              event.end ? formatTime(event.end) : ""
                            }`}
                      </p>
                    </div>
                    <button
                      // 5. 削除ボタンの onClick を修正
                      onClick={(e) => handleDeleteClick(e, event.id)}
                      className="ml-3 rounded-md p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      title="削除"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">
              この日の予定はありません
            </p>
          )}
        </div>

        <button
          onClick={onAddEvent}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-blue-600 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-500/20"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          予定を追加
        </button>
      </div>

      {/* 削除確認モーダル */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">予定を削除</h3>
            <p className="mb-6 text-gray-600">
              本当にこの予定を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-600 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/20"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
