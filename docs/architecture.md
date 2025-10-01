# システムアーキテクチャ設計

## 技術スタック選定

### フロントエンド

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **Calendar**: FullCalendar v6
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI + Lucide React Icons

### バックエンド・データベース

- **Database**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (アバター画像等)
- **API**: Supabase Client + Next.js API Routes (複雑な処理)

### 通知・リアルタイム

- **Real-time**: Supabase Realtime
- **Push Notifications**: Web Push API
- **Email**: Resend or SendGrid
- **Background Jobs**: Supabase Edge Functions

## ディレクトリ構造

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証ページグループ
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # ダッシュボードページグループ
│   │   ├── calendar/
│   │   ├── settings/
│   │   └── notifications/
│   ├── api/                      # API Routes
│   │   ├── calendars/
│   │   ├── events/
│   │   └── notifications/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # 再利用可能コンポーネント
│   ├── ui/                       # Radix UI ラッパー
│   ├── calendar/                 # カレンダー関連コンポーネント
│   ├── forms/                    # フォームコンポーネント
│   └── layout/                   # レイアウトコンポーネント
├── lib/                          # ユーティリティ・設定
│   ├── supabase/                 # Supabase設定
│   ├── validations/              # Zodスキーマ
│   ├── utils/                    # ユーティリティ関数
│   └── stores/                   # Zustand stores
├── types/                        # TypeScript型定義
└── hooks/                        # カスタムフック
```

## データフロー設計

### 1. 認証フロー

```
User Input → Supabase Auth → Session → Protected Routes
```

### 2. カレンダー表示フロー

```
Page Load → Fetch User Calendars → Fetch Events → Render FullCalendar
```

### 3. リアルタイム更新フロー

```
Event Update → Supabase Realtime → Client Update → UI Re-render
```

### 4. 通知フロー

```
Event Creation → Background Job → Calculate Reminder Time → Send Notification
```

## セキュリティ設計

### 認証・認可

- Supabase AuthのJWT認証
- Row Level Security (RLS) によるデータアクセス制御
- カレンダー権限ベースのアクセス制御

### データ保護

- HTTPS通信の強制
- CSRFトークンの使用
- XSS対策（Next.jsの自動エスケープ）
- 入力値のバリデーション（Zod）

## パフォーマンス最適化

### フロントエンド

- Next.js Image最適化
- 動的インポートによるコード分割
- SWRによるデータキャッシング
- Virtual ScrollingでのUI最適化

### バックエンド

- データベースインデックスの最適化
- クエリの最適化
- Supabase Edge Functionsでのサーバーサイド処理

## 開発・デプロイメント

### 開発環境

- ESLint + Prettier
- Husky + lint-staged
- TypeScript strict mode
- Jest + React Testing Library

### デプロイメント

- Vercel (フロントエンド)
- Supabase (バックエンド・データベース)
- 環境変数管理
- CI/CD パイプライン

```

```
