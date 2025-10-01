# Supabase設定手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. プロジェクト名: `calendar-app`
4. データベースパスワードを設定
5. リージョンを選択（日本の場合は Northeast Asia (Tokyo)）
6. プロジェクトが作成されるまで待機（2-3分）

## 2. データベースの設定

1. Supabaseダッシュボードで「SQL Editor」に移動
2. `supabase/schema.sql`の内容をコピー＆ペースト
3. 「Run」ボタンをクリックしてスキーマを実行

## 3. 環境変数の設定

1. Supabaseダッシュボードで「Settings」→「API」に移動
2. 以下の値をコピー：

   - Project URL
   - anon (public) key
   - service_role key

3. `.env.local`ファイルを更新：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. 認証設定

1. Supabaseダッシュボードで「Authentication」→「Settings」に移動
2. 「Site URL」を設定: `http://localhost:3000`
3. 「Redirect URLs」に追加: `http://localhost:3000/auth/callback`

## 5. リアルタイム設定

1. Supabaseダッシュボードで「Database」→「Replication」に移動
2. 以下のテーブルでリアルタイムを有効化：
   - `events`
   - `calendars`
   - `notifications`
   - `calendar_members`

## 6. 動作確認

設定完了後、以下のコマンドで開発サーバーを起動：

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスして動作確認。

## 7. 次のステップ

- ユーザー認証システムの実装
- カレンダーライブラリの変更（FullCalendar）
- イベント管理システムの実装

## トラブルシューティング

### よくあるエラー

1. **「Invalid API key」エラー**

   - `.env.local`のキーが正しく設定されているか確認
   - Next.jsサーバーを再起動

2. **データベース接続エラー**

   - Supabaseプロジェクトが正常に作成されているか確認
   - スキーマが正しく実行されているか確認

3. **認証エラー**
   - Site URLとRedirect URLが正しく設定されているか確認
