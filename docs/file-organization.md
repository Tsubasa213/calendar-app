# ファイル整理ドキュメント

このドキュメントは、2025年11月1日に実施されたファイル整理の詳細を記録しています。

## 実施した整理内容

### 1. 古いファイルの削除

#### 削除されたファイル:

- `src/app/_components/Calendar.old.tsx` - 使用されていない旧バージョンのカレンダーコンポーネント

### 2. Supabase SQLファイルの整理

#### 新しいディレクトリ構造:

```
supabase/
├── migrations/       # データベースマイグレーション用のSQLファイル
│   ├── schema.sql
│   ├── create-user-trigger.sql
│   ├── create-event-types-table.sql
│   ├── event_types.sql
│   ├── add-calendar-icon.sql
│   ├── add-invite-code.sql
│   ├── add-shared-calendar-constraints.sql
│   ├── create-avatar-storage.sql
│   └── fix-rls-policies.sql
│
└── utilities/        # 開発・デバッグ用のユーティリティスクリプト
    ├── check-tables.sql
    ├── drop-all-policies.sql
    └── temp-disable-rls.sql
```

**migrations/**: 本番環境に適用するデータベーススキーマの変更とマイグレーション
**utilities/**: 開発時のデバッグやテスト用のスクリプト

### 3. コンポーネントの整理

#### 新しいディレクトリ構造:

```
src/app/_components/
├── modals/                      # モーダルコンポーネント
│   ├── AddEventModal.tsx
│   ├── EventModal.tsx
│   ├── CalendarSelectorModal.tsx
│   ├── CreateCalendarModal.tsx
│   ├── EditCalendarModal.tsx
│   ├── JoinCalendarModal.tsx
│   └── ShareCalendarModal.tsx
│
├── hooks/                       # カスタムフック
│   ├── useCalendar.ts
│   ├── useEvents.ts
│   └── useSharedCalendars.ts
│
├── Calendar.tsx                 # メインカレンダーコンポーネント
├── Calendar.css
├── CalendarSelector.tsx
├── ConditionalLayout.tsx
├── EventTypeManager.tsx
├── Footer.tsx
├── Header.tsx
└── Sidebar.tsx
```

### 4. インポートパスの更新

以下のファイルのインポートパスを更新しました:

#### `src/app/page.tsx`

- ✅ `EditCalendarModal` のインポートパスを `modals/` に変更
- ✅ `ShareCalendarModal` のインポートパスを `modals/` に変更

#### `src/app/calendars/page.tsx`

- ✅ `CreateCalendarModal` のインポートパスを `modals/` に変更
- ✅ `ShareCalendarModal` のインポートパスを `modals/` に変更
- ✅ `EditCalendarModal` のインポートパスを `modals/` に変更

#### `src/app/_components/Calendar.tsx`

- ✅ `EventModal` のインポートパスを `modals/` に変更
- ✅ `AddEventModal` のインポートパスを `modals/` に変更

#### `src/app/_components/Header.tsx`

- ✅ `CalendarSelectorModal` のインポートパスを `modals/` に変更

## 整理の効果

### メリット:

1. **保守性の向上**: 関連ファイルがグループ化され、コードベースのナビゲーションが容易に
2. **明確な責任分離**: モーダルコンポーネントが専用フォルダに集約
3. **SQLファイルの目的明確化**: マイグレーションとユーティリティが分離され、用途が明確に
4. **クリーンなコードベース**: 未使用ファイルの削除によりプロジェクトがスッキリ

### 注意事項:

- `JoinCalendarModal.tsx` は現在使用されていませんが、将来の実装のため保持されています
- 既存の機能に影響はありません - すべてのインポートパスが正しく更新されています

## 今後の推奨事項

1. **コンポーネントのさらなる分類**:

   - レイアウトコンポーネント（Header, Footer, Sidebar）を `layouts/` フォルダに移動検討
   - カレンダー関連コンポーネントを `calendar/` フォルダに集約検討

2. **型定義の整理**:

   - 複数箇所で使用される共通型を `types/` フォルダに集約

3. **ユーティリティ関数の整理**:

   - 汎用的なヘルパー関数を `lib/utils/` に適切に配置

4. **テストファイルの配置**:
   - 各コンポーネントに対応するテストファイルの追加検討

## 変更履歴

| 日付       | 変更内容             | 担当者         |
| ---------- | -------------------- | -------------- |
| 2025-11-01 | 初回ファイル整理実施 | GitHub Copilot |
