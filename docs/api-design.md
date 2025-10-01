# API設計仕様

## RESTful API エンドポイント

### 認証系API

#### POST /api/auth/signup

ユーザー登録

```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "田中太郎"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "田中太郎"
  },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

#### POST /api/auth/signin

ユーザーログイン

```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### カレンダー系API

#### GET /api/calendars

ユーザーのカレンダー一覧取得

```json
Response:
{
  "calendars": [
    {
      "id": "uuid",
      "name": "個人",
      "description": "個人的な予定",
      "color": "#3B82F6",
      "role": "owner",
      "member_count": 1
    },
    {
      "id": "uuid",
      "name": "チームA",
      "description": "プロジェクトチーム",
      "color": "#10B981",
      "role": "editor",
      "member_count": 5
    }
  ]
}
```

#### POST /api/calendars

新しいカレンダー作成

```json
Request:
{
  "name": "新しいカレンダー",
  "description": "説明",
  "color": "#EF4444"
}

Response:
{
  "calendar": {
    "id": "uuid",
    "name": "新しいカレンダー",
    "description": "説明",
    "color": "#EF4444",
    "owner_id": "uuid",
    "invite_code": "ABC123",
    "created_at": "2025-10-01T00:00:00Z"
  }
}
```

#### PUT /api/calendars/[id]

カレンダー更新

```json
Request:
{
  "name": "更新されたカレンダー名",
  "description": "新しい説明",
  "color": "#F59E0B"
}
```

#### DELETE /api/calendars/[id]

カレンダー削除（オーナーのみ）

### イベント系API

#### GET /api/events

指定期間のイベント取得

```json
Query Parameters:
- start: 2025-10-01
- end: 2025-10-31
- calendar_ids: uuid1,uuid2 (オプション)

Response:
{
  "events": [
    {
      "id": "uuid",
      "title": "会議",
      "description": "週次会議",
      "start_time": "2025-10-01T10:00:00Z",
      "end_time": "2025-10-01T11:00:00Z",
      "is_all_day": false,
      "location": "会議室A",
      "color": "#3B82F6",
      "calendar_id": "uuid",
      "calendar_name": "チームA",
      "created_by": "uuid",
      "recurrence_rule": null
    }
  ]
}
```

#### POST /api/events

新しいイベント作成

```json
Request:
{
  "calendar_id": "uuid",
  "title": "新しい会議",
  "description": "プロジェクト会議",
  "start_time": "2025-10-02T14:00:00Z",
  "end_time": "2025-10-02T15:00:00Z",
  "is_all_day": false,
  "location": "オンライン",
  "color": "#10B981",
  "recurrence_rule": "RRULE:FREQ=WEEKLY;BYDAY=MO",
  "reminders": [
    { "minutes_before": 15, "type": "browser" },
    { "minutes_before": 1440, "type": "email" }
  ]
}

Response:
{
  "event": { /* 作成されたイベント */ }
}
```

#### PUT /api/events/[id]

イベント更新

```json
Request:
{
  "title": "更新されたタイトル",
  "start_time": "2025-10-02T15:00:00Z",
  "end_time": "2025-10-02T16:00:00Z"
}
```

#### DELETE /api/events/[id]

イベント削除

### カレンダー共有系API

#### GET /api/calendars/[id]/members

カレンダーメンバー一覧

```json
Response:
{
  "members": [
    {
      "user_id": "uuid",
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "role": "owner",
      "joined_at": "2025-10-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/calendars/[id]/invite

メンバー招待

```json
Request:
{
  "email": "newuser@example.com",
  "role": "editor"
}

Response:
{
  "invite_url": "https://app.com/join/ABC123",
  "message": "招待メールを送信しました"
}
```

#### POST /api/calendars/join/[invite_code]

招待リンクからカレンダー参加

```json
Response:
{
  "calendar": { /* 参加したカレンダー情報 */ },
  "message": "カレンダーに参加しました"
}
```

### 通知系API

#### GET /api/notifications

未読通知取得

```json
Response:
{
  "notifications": [
    {
      "id": "uuid",
      "type": "event_reminder",
      "title": "会議のリマインダー",
      "message": "15分後に会議が始まります",
      "is_read": false,
      "created_at": "2025-10-01T09:45:00Z",
      "related_event_id": "uuid"
    }
  ],
  "unread_count": 3
}
```

#### PUT /api/notifications/[id]/read

通知を既読にする

#### POST /api/notifications/mark-all-read

全ての通知を既読にする

## WebSocket/リアルタイム通信

### Supabase Realtime Channels

#### calendar_events:[calendar_id]

カレンダーのイベント変更をリアルタイム配信

```json
{
  "event": "INSERT|UPDATE|DELETE",
  "table": "events",
  "record": {
    /* イベントデータ */
  },
  "old_record": {
    /* 更新前データ (UPDATE時) */
  }
}
```

#### user_notifications:[user_id]

ユーザーの通知をリアルタイム配信

```json
{
  "event": "INSERT",
  "table": "notifications",
  "record": {
    /* 通知データ */
  }
}
```

## エラーハンドリング

### HTTPステータスコード

- **200**: 成功
- **201**: 作成成功
- **400**: リクエストエラー
- **401**: 認証エラー
- **403**: 権限エラー
- **404**: リソースが見つからない
- **422**: バリデーションエラー
- **500**: サーバーエラー

### エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値に問題があります",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  }
}
```

## レート制限

- **認証API**: 5回/分
- **イベントAPI**: 100回/分
- **その他API**: 60回/分

## APIキー・認証

- Bearer Token認証（Supabase JWT）
- CORS設定
- CSRF保護
