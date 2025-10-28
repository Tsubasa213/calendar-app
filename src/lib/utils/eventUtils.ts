import { Event, DbEvent } from "@/types/event.types";

/**
 * データベースのイベントをFullCalendar形式に変換
 */
export function convertDbEventToCalendarEvent(event: DbEvent): Event {
  // 全日イベントの場合は日付のみを使用（タイムゾーンの影響を避ける）
  if (event.is_all_day) {
    const startDate = event.start_time.split("T")[0];
    const endDate = event.end_time.split("T")[0];

    // FullCalendarの全日イベントは終了日を翌日にする必要がある
    const endDateObj = new Date(endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const formattedEndDate = endDateObj.toISOString().split("T")[0];

    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: formattedEndDate,
      allDay: true,
      color: event.color || "#3B82F6",
    };
  } else {
    // 時間制イベントはそのまま使用
    return {
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      allDay: false,
      color: event.color || "#3B82F6",
    };
  }
}

/**
 * 指定した日付のイベントをフィルタリング
 */
export function getEventsForDate(events: Event[], dateStr: string): Event[] {
  return events.filter((event) => {
    const eventDate = event.start.split("T")[0];
    return eventDate === dateStr;
  });
}

/**
 * イベントの日時を更新する（ドラッグ&ドロップ用）
 */
export function calculateNewEventTimes(
  event: any,
  isAllDay: boolean
): { newStartTime: string; newEndTime: string } {
  if (isAllDay) {
    // 全日イベントの場合 - イベントの期間(日数)を保持
    const newStart = event.start;
    const newEnd = event.end;

    if (!newStart || !newEnd) {
      throw new Error("イベントの日付情報が不正です");
    }

    // ローカルタイムゾーンでの日付を取得
    const year = newStart.getFullYear();
    const month = String(newStart.getMonth() + 1).padStart(2, "0");
    const day = String(newStart.getDate()).padStart(2, "0");
    const newStartDate = `${year}-${month}-${day}`;

    // FullCalendarのendは排他的なので、1日引いたものが実際の最終日
    const actualEndDate = new Date(newEnd);
    actualEndDate.setDate(actualEndDate.getDate() - 1);
    const endYear = actualEndDate.getFullYear();
    const endMonth = String(actualEndDate.getMonth() + 1).padStart(2, "0");
    const endDay = String(actualEndDate.getDate()).padStart(2, "0");
    const newEndDateStr = `${endYear}-${endMonth}-${endDay}`;

    return {
      newStartTime: `${newStartDate}T00:00:00`,
      newEndTime: `${newEndDateStr}T23:59:59`,
    };
  } else {
    // 時間制イベントの場合 - FullCalendarが計算した新しい日時を使用
    const newStart = event.start;
    const newEnd = event.end;

    if (!newStart) {
      throw new Error("イベントの日付情報が不正です");
    }

    // ローカルタイムゾーンでの日時を取得
    const year = newStart.getFullYear();
    const month = String(newStart.getMonth() + 1).padStart(2, "0");
    const day = String(newStart.getDate()).padStart(2, "0");
    const hours = String(newStart.getHours()).padStart(2, "0");
    const minutes = String(newStart.getMinutes()).padStart(2, "0");
    const seconds = String(newStart.getSeconds()).padStart(2, "0");
    const newStartTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    let newEndTime: string;
    if (newEnd) {
      const endYear = newEnd.getFullYear();
      const endMonth = String(newEnd.getMonth() + 1).padStart(2, "0");
      const endDay = String(newEnd.getDate()).padStart(2, "0");
      const endHours = String(newEnd.getHours()).padStart(2, "0");
      const endMinutes = String(newEnd.getMinutes()).padStart(2, "0");
      const endSeconds = String(newEnd.getSeconds()).padStart(2, "0");
      newEndTime = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:${endSeconds}`;
    } else {
      // 終了時刻がない場合は開始時刻と同じにする
      newEndTime = newStartTime;
    }

    return { newStartTime, newEndTime };
  }
}

/**
 * イベントを更新後のローカル状態用に変換
 */
export function updateEventInList(
  events: Event[],
  eventId: string,
  newStartTime: string,
  newEndTime: string,
  isAllDay: boolean
): Event[] {
  return events.map((e) =>
    e.id === eventId
      ? {
          ...e,
          start: isAllDay ? newStartTime.split("T")[0] : newStartTime,
          end: isAllDay
            ? (() => {
                // FullCalendar用に+1日
                const endDate = new Date(newEndTime.split("T")[0]);
                endDate.setDate(endDate.getDate() + 1);
                return endDate.toISOString().split("T")[0];
              })()
            : newEndTime,
        }
      : e
  );
}
