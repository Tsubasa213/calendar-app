# データベース連携実装ガイド

## 実装完了事項

### 1. Supabase連携

- `Calendar.tsx`にSupabaseクライアントを統合
- イベントのCRUD操作をデータベースに対応

### 2. 主な機能

#### イベントの取得

- アプリ起動時にデータベースからイベントを自動取得
- ユーザーがログインしていない場合はサンプルデータを表示

#### イベントの保存

- 新しい予定を追加すると自動的にデータベースに保存
- `events`テーブルに以下の情報を保存:
  - タイトル
  - 開始時刻
  - 終了時刻
  - 終日フラグ
  - 色
  - カレンダーID
  - 作成者ID

#### カレンダーの自動作成

- ユーザーが初めてアプリを使用する際、デフォルトカレンダー「マイカレンダー」を自動作成

## セットアップ手順

### 1. 環境変数の設定

`.env.local`ファイルを作成して以下を設定:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQL Editorで`supabase/schema.sql`を実行してテーブルを作成
3. Settings > APIから必要なキーを取得

### 3. 認証の設定（オプション）

現在の実装では、ユーザーがログインしていない場合でもサンプルデータで動作します。

完全な認証機能を実装する場合:

- Supabase Authを使用したログイン/サインアップ機能を追加
- Row Level Security (RLS)ポリシーが適用される

## データフロー

```
ユーザーアクション
    ↓
Calendar.tsx (フロントエンド)
    ↓
Supabase Client (lib/supabase/client.ts)
    ↓
Supabase Database (events, calendars テーブル)
```

## コード例

### イベントの追加

```typescript
const { data: newEventData, error } = await supabase
  .from("events")
  .insert({
    calendar_id: defaultCalendarId,
    title: newEventTitle,
    start_time: startTime,
    end_time: endTime,
    is_all_day: newEventAllDay,
    color: "#3B82F6",
    created_by: user.id,
  })
  .select()
  .single();
```

### イベントの取得

```typescript
const { data: eventsData, error: eventsError } = await supabase
  .from("events")
  .select("*")
  .eq("calendar_id", calendarId);
```

## 今後の拡張予定

- [ ] イベントの編集機能
- [ ] イベントの削除機能
- [ ] 複数カレンダーのサポート
- [ ] カレンダーの共有機能
- [ ] リマインダー機能
- [ ] 繰り返しイベントのサポート

## トラブルシューティング

### イベントが保存されない場合

1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトが実行中か確認
3. ブラウザのコンソールでエラーメッセージを確認
4. Supabaseダッシュボードでテーブルが正しく作成されているか確認

### RLSポリシーエラー

データベースのRLS（Row Level Security）ポリシーを確認してください。
`schema.sql`に定義されているポリシーが正しく適用されているか確認が必要です。

## 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [FullCalendar Documentation](https://fullcalendar.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
