import { Database } from "./database";

export type Event = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
};

export type DbEvent = Database["public"]["Tables"]["events"]["Row"];

export interface CalendarComponentProps {
  onCalendarReady?: (goToToday: () => void) => void;
  onAddEventReady?: (openAddEventModal: () => void) => void;
  eventTypes: EventType[];
}

export interface EventFormData {
  id?: string; // 編集対象のID (新規作成時は undefined)
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  genre: string;
  memo: string;
}

export const EVENT_TYPE_COLORS = [
  "#3B82F6", // 青
  "#EF4444", // 赤
  "#10B981", // 緑
  "#F59E0B", // アンバー
  "#8B5CF6", // 紫
  "#EC4899", // ピンク
  "#14B8A6", // ティール
  "#F97316", // オレンジ
  "#6366F1", // インディゴ
  "#22D3EE", // シアン
];

export type EventType = {
  id: string;
  name: string;
  color: string; // EVENT_TYPE_COLORSから選択
};
