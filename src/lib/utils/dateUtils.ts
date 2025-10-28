/**
 * 日付文字列をローカル表記でフォーマット
 */
export function formatDateForDisplay(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

/**
 * 時刻をフォーマット
 */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 2つの日付間の日数を計算
 */
export function calculateDaysDiff(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}
