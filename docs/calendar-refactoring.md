# Calendar.tsx リファクタリング完了

## 概要

Calendar.tsxを1083行から375行に削減しました（約65%の削減）。

## 新しいファイル構造

### 型定義

- **`src/types/event.types.ts`** - イベント関連の型定義
  - `Event` - カレンダーイベントの型
  - `DbEvent` - データベースイベントの型
  - `CalendarComponentProps` - カレンダーコンポーネントのプロップス
  - `EventFormData` - イベントフォームのデータ型

### ユーティリティ関数

- **`src/lib/utils/eventUtils.ts`** - イベント操作関連のユーティリティ

  - `convertDbEventToCalendarEvent()` - DBイベントをカレンダー形式に変換
  - `getEventsForDate()` - 指定日付のイベントをフィルタリング
  - `calculateNewEventTimes()` - ドラッグ&ドロップ時の日時計算
  - `updateEventInList()` - イベントリストの更新

- **`src/lib/utils/dateUtils.ts`** - 日付操作関連のユーティリティ
  - `formatDateForDisplay()` - 日付を表示用にフォーマット
  - `formatTime()` - 時刻をフォーマット
  - `calculateDaysDiff()` - 日数差を計算
  - `getTodayString()` - 今日の日付を取得

### カスタムフック

- **`src/app/_components/hooks/useEvents.ts`** - イベント管理ロジック

  - `useEvents()` - イベントのCRUD操作を提供
    - `events` - イベント一覧
    - `isLoading` - 読み込み状態
    - `addEvent()` - イベント追加
    - `deleteEvent()` - イベント削除
    - `updateEvent()` - イベント更新

- **`src/app/_components/hooks/useCalendar.ts`** - カレンダー操作ロジック
  - `useCalendar()` - カレンダーのUI操作を提供
    - `calendarRef` - FullCalendarへの参照
    - `registerGoToToday()` - 「今日」へ移動機能の登録

### UIコンポーネント

- **`src/app/_components/EventModal.tsx`** - イベント詳細モーダル

  - 選択した日付のイベント一覧表示
  - イベント削除機能
  - 予定追加ボタン

- **`src/app/_components/AddEventModal.tsx`** - イベント追加モーダル
  - イベント情報の入力フォーム
  - タイトル、日時、終日フラグ、ジャンル、メモ

### メインコンポーネント

- **`src/app/_components/Calendar.tsx`** (375行)
  - FullCalendarの設定と表示
  - イベントハンドラーの統合
  - モーダルの状態管理

## リファクタリングの利点

1. **可読性の向上**

   - 各ファイルが単一の責任を持つ
   - ロジックとUIが分離されている

2. **保守性の向上**

   - 機能ごとにファイルが分離されているため、変更が容易
   - テストが書きやすい構造

3. **再利用性の向上**

   - ユーティリティ関数は他のコンポーネントでも利用可能
   - カスタムフックは他のカレンダー関連機能でも使える

4. **型安全性の向上**
   - 型定義が一元管理されている
   - TypeScriptの恩恵を最大限活用

## バックアップ

元のファイルは `Calendar.old.tsx` として保存されています。
