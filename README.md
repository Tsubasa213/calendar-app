# 📅 カレンダー共有アプリ

複数のカレンダーを作成・共有できるWebアプリケーションです。Next.js + Supabaseで構築されています。

## ✨ 主な機能

- 📅 **カレンダー表示** - 月/週/日/リスト表示切り替え
- ✏️ **イベント管理** - イベントの作成・編集・削除
- 🎨 **イベントタイプ** - カスタマイズ可能なイベント分類
- � **カレンダー共有** - 招待コードでメンバーを追加
- 🔐 **権限管理** - オーナー/編集者/閲覧者の役割設定
- 📱 **レスポンシブ対応** - スマートフォンでも快適に利用可能
- 🎯 **デフォルトカレンダー** - 個人用カレンダーを自動作成

## �🚀 クイックスタート

### 必要要件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/Tsubasa213/calendar-app.git
cd calendar-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

### 環境変数の設定

`.env`ファイルに以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### データベースのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで以下のファイルを順番に実行：
   ```
   supabase/migrations/schema.sql
   supabase/migrations/create-user-trigger.sql
   supabase/migrations/create-event-types-table.sql
   supabase/migrations/add-event-types-rls.sql
   ```
3. RLSポリシーが正しく設定されていることを確認

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## ️ 技術スタック

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React + FontAwesome
- **Calendar**: FullCalendar

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (アバター画像)
- **RLS**: Row Level Security for data protection

### State Management

- React Context API (Calendar & Auth)

## 📁 プロジェクト構造

```
calendar-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── _components/          # UI Components
│   │   │   ├── modals/          # モーダルコンポーネント
│   │   │   └── hooks/           # カスタムフック
│   │   ├── calendars/           # カレンダー管理ページ
│   │   ├── context/             # Context API (Auth, Calendar)
│   │   ├── login/               # ログインページ
│   │   └── settings/            # 設定ページ
│   ├── lib/                      # ライブラリ・ユーティリティ
│   │   ├── queries/             # データベースクエリ
│   │   ├── supabase/            # Supabase設定
│   │   └── utils/               # ヘルパー関数
│   └── types/                    # TypeScript型定義
├── supabase/
│   ├── migrations/              # データベースマイグレーション
│   └── utilities/               # デバッグ用スクリプト
├── public/                       # 静的ファイル
└── docs/                         # ドキュメント
```

## 📚 ドキュメント

詳細なドキュメントは `docs/` フォルダを参照してください：

- [アーキテクチャ設計](docs/architecture.md)
- [データベース設計](docs/database-schema.md)
- [Supabaseセットアップ](docs/supabase-setup.md)
- [カレンダー共有機能](docs/shared-calendar-implementation.md)
- [API設計](docs/api-design.md)
- [UI/UX設計](docs/ui-ux-design.md)

## 🔧 開発

### ビルド

```bash
npm run build
```

### 本番環境での実行

```bash
npm start
```

### コードフォーマット

```bash
npm run lint
```

## 🚢 デプロイ

### Vercel（推奨）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tsubasa213/calendar-app)

1. Vercelアカウントでリポジトリをインポート
2. 環境変数を設定
3. デプロイ

### その他のプラットフォーム

- Netlify
- AWS Amplify
- Docker

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📝 ライセンス

MIT

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [FullCalendar](https://fullcalendar.io/)
- [Tailwind CSS](https://tailwindcss.com/)
