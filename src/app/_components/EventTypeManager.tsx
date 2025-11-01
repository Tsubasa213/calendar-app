"use client";
import { useState } from "react";
import { EVENT_TYPE_COLORS, EventType } from "@/types/event.types";

interface EventTypeManagerProps {
  eventTypes: EventType[];
  onChange: (types: EventType[]) => void;
}

export default function EventTypeManager({
  eventTypes,
  onChange,
}: EventTypeManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>("");
  const [error, setError] = useState("");

  const usedColors = eventTypes.map((t) => t.color);
  const availableColors = EVENT_TYPE_COLORS.filter(
    (c) => !usedColors.includes(c)
  );

  const handleAdd = () => {
    setError("");
    if (!name.trim()) {
      setError("ジャンル名を入力してください");
      return;
    }
    if (!color) {
      setError("カラーを選択してください");
      return;
    }
    if (eventTypes.length >= 10) {
      setError("ジャンルは最大10個までです");
      return;
    }
    onChange([...eventTypes, { id: crypto.randomUUID(), name, color }]);
    setName("");
    setColor("");
  };

  const handleDelete = (id: string) => {
    onChange(eventTypes.filter((t) => t.id !== id));
  };

  return (
    <div className="rounded bg-gray-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        予定ジャンル作成
      </h3>
      <div className="mb-2 flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ジャンル名"
          className="h-10 rounded border px-3 py-2 text-sm"
          maxLength={20}
        />
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
          {availableColors.map((c, i) => (
            <button
              key={c}
              type="button"
              className={`size-10 rounded-full border-2 transition-transform ${color === c ? "scale-110 border-blue-500 shadow-lg" : "border-gray-300"} ${usedColors.includes(c) ? "cursor-not-allowed opacity-30" : "hover:scale-105"}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              disabled={usedColors.includes(c)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="h-10 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
        >
          追加
        </button>
      </div>
      {error && <div className="mb-2 text-xs text-red-600">{error}</div>}

      {/* --- ▼ 修正点: このdivに max-h と overflow-y-auto を追加 ▼ --- */}
      <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded border border-gray-200 bg-white p-2">
        {/* --- ▲ 修正点 ▲ --- */}
        {eventTypes.length > 0 ? (
          eventTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1 rounded border px-2 py-1 text-sm"
              style={{ backgroundColor: t.color }}
            >
              <span className="font-medium text-white drop-shadow">
                {t.name}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="ml-1 text-xs text-white hover:text-red-200"
                title="削除"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <span className="w-full text-center text-xs text-gray-400">
            ジャンルがありません
          </span>
        )}
      </div>
    </div>
  );
}
