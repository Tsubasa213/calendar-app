# Time Tree Calendar App

Time Treeライクなカレンダー共有アプリです。Next.js + Supabaseで構築されています。

## 🚀 セットアップ

### 1. プロジェクトのクローン
```bash
git clone [repository-url]
cd next-calender-app
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
```bash
# .env.exampleを.envにコピー
cp .env.example .env
```

`.env`ファイルを編集して、Supabaseプロジェクトの情報を設定してください：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### 4. Supabaseデータベースの設定
1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで`supabase/schema.sql`を実行
3. リアルタイム機能を有効化（events, calendars, notifications, calendar_membersテーブル）

### 5. 開発サーバーの起動
```bash
npm run dev
```

## 📋 機能

- 👤 ユーザー認証（Supabase Auth）
- 📅 カレンダー表示（月/週/日表示）
- 🎯 イベント作成・編集・削除
- 👥 カレンダー共有
- 🔔 通知機能
- 📱 レスポンシブデザイン

## 🛠️ 技術スタック

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Calendar**: FullCalendar
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

## 📁 プロジェクト構造

```
src/
├── app/              # Next.js App Router
├── components/       # 再利用可能コンポーネント
├── lib/             # ライブラリ設定（Supabase等）
├── types/           # TypeScript型定義
└── hooks/           # カスタムフック
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
