# API 設計書

## 1. 概要

本ドキュメントは、学生向けコミュニティプラットフォーム MVP の API 設計を定義する。

### 技術方針

| 区分 | 用途 | 方式 |
|---|---|---|
| Server Actions | Server Component からのフォーム送信・データ変更操作 | `"use server"` 関数 |
| API Routes (`app/api/`) | クライアントサイド fetch、ポーリング、外部連携、Webhook | REST エンドポイント |

**使い分けの原則:**
- フォーム送信やボタンクリックによるデータ変更 → Server Actions
- クライアントコンポーネントからのデータ取得・リアルタイム更新 → API Routes
- Webhook 受信（Supabase Auth callback 等） → API Routes

### ベース URL

```
/api/v1/...       # API Routes
actions/...        # Server Actions（ファイルパスベース、URLなし）
```

---

## 2. ロール定義

| ロール | 説明 | 権限レベル |
|---|---|---|
| `guest` | 未ログインユーザー | 公開情報の閲覧のみ |
| `user` | ログイン済み・年齢未確認 | 基本機能（年齢確認の提出まで） |
| `minor` | 年齢確認済み未成年（保護者同意済み） | 一般機能（一部制限あり） |
| `verified` | 年齢確認済み成年 | 一般機能フルアクセス |
| `mentor` | 審査済みメンター | メンター機能 + 一般機能 |
| `admin` | 管理者 | 全機能 |

**ロール昇格フロー:**
```
guest → user（登録時）→ verified / minor（年齢確認後）→ mentor（審査後）
```

---

## 3. 共通レスポンス形式

### 成功レスポンス

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      { "field": "email", "message": "メールアドレスの形式が正しくありません" }
    ]
  }
}
```

### 共通エラーコード

| コード | HTTP Status | 説明 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | 権限不足 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `VALIDATION_ERROR` | 422 | 入力値バリデーションエラー |
| `RATE_LIMITED` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |
| `AGE_VERIFICATION_REQUIRED` | 403 | 年齢確認が未完了 |
| `PARENTAL_CONSENT_REQUIRED` | 403 | 保護者同意が未完了 |
| `MODERATION_REJECTED` | 422 | コンテンツがモデレーション基準に違反 |

---

## 4. 認証・認可ミドルウェアパターン

### 認証ミドルウェア（`middleware.ts`）

```
src/
  middleware.ts                    # Next.js Middleware（認証チェック）
  lib/
    auth/
      get-session.ts              # Supabase セッション取得
      require-auth.ts             # 認証必須ヘルパー
      require-role.ts             # ロール検証ヘルパー
      require-age-verified.ts     # 年齢確認済み検証
```

**パターン:**

1. `middleware.ts` で全 `/api/v1/*` リクエストの JWT を検証
2. 各 API Route / Server Action 内で `requireAuth()` → `requireRole(["verified", "admin"])` の順にガード
3. 年齢確認が必要なエンドポイントでは `requireAgeVerified()` を追加

```typescript
// API Route での使用例
export async function GET(request: Request) {
  const session = await requireAuth();          // 未認証なら 401
  await requireRole(session, ["verified"]);     // 権限不足なら 403
  // ...ビジネスロジック
}

// Server Action での使用例
"use server"
export async function createPost(formData: FormData) {
  const session = await requireAuth();
  await requireRole(session, ["verified", "minor"]);
  await requireAgeVerified(session);
  // ...ビジネスロジック
}
```

---

## 5. レート制限

### 方針

MVP ではシンプルなインメモリ（またはSupabase）ベースのレート制限を採用する。

| エンドポイントカテゴリ | 制限 | ウィンドウ |
|---|---|---|
| 認証系（登録・ログイン・パスワードリセット） | 5 回 | 15 分 |
| 投稿・コメント作成 | 10 回 | 1 分 |
| AI チャット（モック） | 20 回 | 1 時間 |
| 一般 API（読み取り） | 60 回 | 1 分 |
| 通報 | 5 回 | 1 時間 |

**実装:** `next-rate-limit` または Supabase Edge Function のカウンター方式。
レスポンスヘッダに `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` を含める。

---

## 6. API エンドポイント一覧

### 6.1 認証（Auth）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/register` | 会員登録 | API Route | 不要 | guest |
| POST | `/api/v1/auth/login` | ログイン | API Route | 不要 | guest |
| POST | `/api/v1/auth/logout` | ログアウト | API Route | 必要 | 全ロール |
| POST | `/api/v1/auth/password-reset` | パスワードリセット要求 | API Route | 不要 | guest |
| POST | `/api/v1/auth/password-reset/confirm` | パスワードリセット実行 | API Route | 不要 | guest |
| GET | `/api/v1/auth/callback` | OAuth / メール認証コールバック | API Route | 不要 | — |
| POST | `/api/v1/auth/resend-verification` | メール認証再送信 | API Route | 必要 | user |

**備考:**
- Supabase Auth を利用。`/api/v1/auth/callback` は Supabase からのリダイレクト先。
- 登録・ログインはクライアントサイドで Supabase SDK を直接呼ぶことも可能だが、サーバー側でのバリデーションとレート制限のため API Route を経由する。

---

### 6.2 年齢確認（Age Verification）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| — | `actions/verification/submit` | 年齢確認書類の提出 | Server Action | 必要 | user |
| GET | `/api/v1/verification/status` | 自分の確認ステータス取得 | API Route | 必要 | user 以上 |
| GET | `/api/v1/admin/verifications` | 確認申請一覧（管理者） | API Route | 必要 | admin |
| GET | `/api/v1/admin/verifications/:id` | 確認申請詳細（管理者） | API Route | 必要 | admin |
| — | `actions/admin/verification/review` | 確認申請の承認・却下 | Server Action | 必要 | admin |

---

### 6.3 保護者同意（Parental Consent）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| — | `actions/consent/submit` | 保護者同意書の提出 | Server Action | 必要 | user（未成年） |
| GET | `/api/v1/consent/status` | 同意ステータス取得 | API Route | 必要 | user 以上 |
| GET | `/api/v1/admin/consents` | 同意申請一覧（管理者） | API Route | 必要 | admin |
| — | `actions/admin/consent/review` | 同意申請の承認・却下 | Server Action | 必要 | admin |

---

### 6.4 オンボーディング（Onboarding）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/tags` | 興味タグ一覧取得 | API Route | 必要 | user 以上 |
| — | `actions/onboarding/select-tags` | 興味タグ選択・保存 | Server Action | 必要 | verified, minor |
| — | `actions/onboarding/submit-diagnosis` | 簡易診断回答の送信 | Server Action | 必要 | verified, minor |
| GET | `/api/v1/onboarding/recommendations` | おすすめコミュニティ取得 | API Route | 必要 | verified, minor |

**備考:** 診断結果に基づくおすすめはルールベースのロジックで生成（MVP）。

---

### 6.5 ホーム・フィード（Home / Feed）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/feed` | タグベースフィード取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/feed/recommendations` | おすすめフィード取得 | API Route | 必要 | verified, minor |

**クエリパラメータ（`/api/v1/feed`）:**
- `tags` — カンマ区切りのタグID
- `page` — ページ番号（デフォルト: 1）
- `per_page` — 件数（デフォルト: 20、最大: 50）
- `sort` — `latest` | `popular`（デフォルト: `latest`）

---

### 6.6 Q&A

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/posts` | 投稿一覧取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/posts/:id` | 投稿詳細取得 | API Route | 必要 | verified, minor |
| — | `actions/posts/create` | 投稿作成 | Server Action | 必要 | verified, minor |
| — | `actions/posts/update` | 投稿編集 | Server Action | 必要 | verified, minor（本人のみ） |
| — | `actions/posts/delete` | 投稿削除 | Server Action | 必要 | verified, minor（本人）, admin |
| GET | `/api/v1/posts/:id/comments` | コメント一覧取得 | API Route | 必要 | verified, minor |
| — | `actions/comments/create` | コメント作成 | Server Action | 必要 | verified, minor |
| — | `actions/comments/update` | コメント編集 | Server Action | 必要 | verified, minor（本人のみ） |
| — | `actions/comments/delete` | コメント削除 | Server Action | 必要 | verified, minor（本人）, admin |
| — | `actions/posts/react` | リアクション追加・解除 | Server Action | 必要 | verified, minor |
| — | `actions/posts/report` | 投稿・コメントの通報 | Server Action | 必要 | verified, minor |

**備考:**
- 投稿作成・コメント作成時に AI モデレーション（ルールベース）をサーバー側で自動実行する。
- 本人確認は `session.user.id === post.author_id` で行う。

---

### 6.7 ルーム（Rooms）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/rooms` | ルーム一覧取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/rooms/:id` | ルーム詳細取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/rooms/:id/members` | ルームメンバー一覧 | API Route | 必要 | verified, minor（メンバーのみ） |
| — | `actions/rooms/create` | ルーム作成申請 | Server Action | 必要 | verified |
| — | `actions/rooms/join` | ルーム参加 | Server Action | 必要 | verified, minor |
| — | `actions/rooms/leave` | ルーム退出 | Server Action | 必要 | verified, minor |
| — | `actions/rooms/update-profile` | ルーム専用プロフィール更新 | Server Action | 必要 | verified, minor（メンバーのみ） |
| GET | `/api/v1/rooms/:id/profile` | 自分のルームプロフィール取得 | API Route | 必要 | verified, minor（メンバーのみ） |

**クエリパラメータ（`/api/v1/rooms`）:**
- `tags` — カンマ区切りのタグID
- `page`, `per_page`
- `search` — キーワード検索

**備考:**
- ルーム作成は申請制。管理者が承認するまで公開されない。
- 未成年（`minor`）はルーム作成不可。

---

### 6.8 イベント（Events）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/events` | イベント一覧取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/events/:id` | イベント詳細取得 | API Route | 必要 | verified, minor |
| — | `actions/events/create` | イベント作成 | Server Action | 必要 | verified |
| — | `actions/events/update` | イベント編集 | Server Action | 必要 | verified（主催者のみ） |
| — | `actions/events/delete` | イベント削除 | Server Action | 必要 | verified（主催者）, admin |
| — | `actions/events/join` | イベント参加 | Server Action | 必要 | verified, minor |
| — | `actions/events/cancel` | イベント参加キャンセル | Server Action | 必要 | verified, minor（本人のみ） |

**クエリパラメータ（`/api/v1/events`）:**
- `tags` — カンマ区切りのタグID
- `page`, `per_page`
- `status` — `upcoming` | `ongoing` | `ended`（デフォルト: `upcoming`）
- `from`, `to` — 日付範囲フィルタ（ISO 8601）

**備考:**
- 未成年（`minor`）はイベント作成不可。
- 管理者はイベントを強制停止できる（管理者エンドポイントで実施）。

---

### 6.9 メンター相談（Mentor Consultation）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/mentors` | メンター一覧取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/mentors/:id` | メンター詳細取得 | API Route | 必要 | verified, minor |
| GET | `/api/v1/mentors/:id/slots` | メンターの空き枠一覧 | API Route | 必要 | verified, minor |
| — | `actions/consultations/book` | 相談予約 | Server Action | 必要 | verified, minor |
| — | `actions/consultations/cancel` | 予約キャンセル | Server Action | 必要 | verified, minor（本人のみ） |
| GET | `/api/v1/consultations` | 自分の予約一覧 | API Route | 必要 | verified, minor, mentor |
| GET | `/api/v1/consultations/:id` | 予約詳細 | API Route | 必要 | verified, minor, mentor（当事者のみ） |
| — | `actions/mentors/update-slots` | 空き枠の登録・更新 | Server Action | 必要 | mentor |
| — | `actions/consultations/update-status` | 予約ステータス変更（承認・完了・拒否） | Server Action | 必要 | mentor |

**予約ステータスフロー:**
```
pending → approved → completed
pending → rejected
approved → cancelled（ユーザーによるキャンセル）
```

**備考:**
- 相談は予約制導線上でのみ行われる（非監督の私的DMは禁止）。
- 全相談ログは監査可能な形で保持する。

---

### 6.10 AI チャットサポート（モック）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| POST | `/api/v1/ai/chat` | AI チャットメッセージ送信 | API Route | 必要 | verified, minor |
| GET | `/api/v1/ai/chat/history` | チャット履歴取得 | API Route | 必要 | verified, minor |

**備考:**
- MVP ではモック実装。キーワードマッチングによる固定レスポンスを返す。
- ストリーミングレスポンスは MVP では非対応。将来的に SSE で対応予定。
- API Route を使用する理由：クライアントコンポーネントからのインタラクティブな送受信のため。

**リクエスト例:**
```json
{
  "message": "プログラミングの勉強方法を教えて",
  "conversation_id": "uuid-optional"
}
```

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "response": "プログラミングの勉強には、まず興味のある分野を見つけることが大切です。...",
    "conversation_id": "uuid"
  }
}
```

---

### 6.11 AI プロフィール生成（モック）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| POST | `/api/v1/ai/profile/generate` | プロフィール下書き生成 | API Route | 必要 | verified, minor |
| — | `actions/profile/save` | プロフィール保存 | Server Action | 必要 | verified, minor |

**備考:**
- MVP ではテンプレートベースの固定文章を返すモック実装。
- ユーザーの興味タグ・診断結果を元に下書きを生成する想定。

---

### 6.12 AI モデレーション（ルールベース）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| POST | `/api/v1/ai/moderation/check` | コンテンツ審査（内部利用） | API Route | 必要 | admin（手動テスト用） |

**備考:**
- モデレーションは投稿・コメント作成時にサーバー内部で自動呼び出しされる。
- 外部からの直接呼び出しは管理者のテスト用途のみ。
- ルールベース判定：NGワードリスト照合、外部SNS URL検出、連絡先パターン検出。

**内部関数インターフェース:**
```typescript
async function checkModeration(content: string): Promise<{
  approved: boolean;
  reasons: string[];     // 違反理由の配列
  flagged_words: string[];
}>
```

---

### 6.13 管理者機能（Admin）

#### 通報管理

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/reports` | 通報一覧取得 | API Route | 必要 | admin |
| GET | `/api/v1/admin/reports/:id` | 通報詳細取得 | API Route | 必要 | admin |
| — | `actions/admin/reports/resolve` | 通報対応（承認・却下・対象コンテンツ削除） | Server Action | 必要 | admin |

#### メンター審査

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/mentor-applications` | メンター申請一覧 | API Route | 必要 | admin |
| GET | `/api/v1/admin/mentor-applications/:id` | メンター申請詳細 | API Route | 必要 | admin |
| — | `actions/admin/mentors/review` | メンター申請の承認・却下 | Server Action | 必要 | admin |

#### ルーム承認

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/room-applications` | ルーム作成申請一覧 | API Route | 必要 | admin |
| — | `actions/admin/rooms/review` | ルーム申請の承認・却下 | Server Action | 必要 | admin |

#### イベント管理

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/events` | イベント一覧（管理者ビュー） | API Route | 必要 | admin |
| — | `actions/admin/events/stop` | イベント強制停止 | Server Action | 必要 | admin |

#### NGワード管理

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/ng-words` | NGワード一覧取得 | API Route | 必要 | admin |
| — | `actions/admin/ng-words/create` | NGワード追加 | Server Action | 必要 | admin |
| — | `actions/admin/ng-words/update` | NGワード編集 | Server Action | 必要 | admin |
| — | `actions/admin/ng-words/delete` | NGワード削除 | Server Action | 必要 | admin |

#### 監査ログ

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/audit-logs` | 監査ログ一覧取得 | API Route | 必要 | admin |

**クエリパラメータ（`/api/v1/admin/audit-logs`）:**
- `user_id` — 特定ユーザーで絞り込み
- `action` — アクション種別で絞り込み
- `from`, `to` — 日時範囲
- `page`, `per_page`

---

### 6.14 通知（Notifications）

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/notifications` | 通知一覧取得 | API Route | 必要 | user 以上 |
| — | `actions/notifications/mark-read` | 通知を既読にする | Server Action | 必要 | user 以上 |
| — | `actions/notifications/mark-all-read` | 全通知を既読にする | Server Action | 必要 | user 以上 |

**クエリパラメータ（`/api/v1/notifications`）:**
- `unread_only` — `true` の場合、未読のみ（デフォルト: `false`）
- `page`, `per_page`

---

### 6.15 ユーザープロフィール

| Method | Path | 説明 | 方式 | 認証 | 許可ロール |
|---|---|---|---|---|---|
| GET | `/api/v1/users/me` | 自分のプロフィール取得 | API Route | 必要 | user 以上 |
| — | `actions/users/update-profile` | プロフィール更新 | Server Action | 必要 | user 以上 |
| GET | `/api/v1/users/:id` | ユーザー公開プロフィール取得 | API Route | 必要 | verified, minor |

---

## 7. エラーハンドリング戦略

### 7.1 バリデーション

- **入力バリデーション:** Zod スキーマで全リクエストを検証する。
- **Server Actions:** `zod` + `useActionState` でフォームバリデーションを行う。
- **API Routes:** リクエストボディ・クエリパラメータを Zod で検証する。

```typescript
// バリデーションスキーマの例
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  tags: z.array(z.string().uuid()).min(1).max(5),
});
```

### 7.2 エラーハンドリングのレイヤー

```
リクエスト
  → middleware.ts（認証チェック）
    → API Route / Server Action
      → バリデーション（Zod）
        → 認可チェック（ロール・所有権）
          → ビジネスロジック
            → Supabase クエリ
```

各レイヤーでエラーが発生した場合、適切なエラーコードとメッセージを返す。

### 7.3 グローバルエラーハンドラー

```typescript
// lib/api/error-handler.ts
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "入力内容に誤りがあります",
        details: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    }, { status: 422 });
  }

  if (error instanceof AuthError) {
    return NextResponse.json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "認証が必要です" },
    }, { status: 401 });
  }

  // 予期しないエラー（詳細はログのみ、クライアントには汎用メッセージ）
  console.error("Unexpected error:", error);
  return NextResponse.json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "サーバーエラーが発生しました" },
  }, { status: 500 });
}
```

### 7.4 Server Actions のエラー返却

Server Actions はレスポンスオブジェクトを返せないため、戻り値でエラー状態を表現する。

```typescript
type ActionResult<T = void> = {
  success: true;
  data?: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};
```

---

## 8. 監査ログ記録

以下のアクションで監査ログを自動記録する。

| アクション種別 | 記録タイミング |
|---|---|
| `auth.login` | ログイン成功時 |
| `auth.register` | 会員登録時 |
| `verification.submit` | 年齢確認提出時 |
| `verification.review` | 年齢確認審査時 |
| `consent.submit` | 保護者同意提出時 |
| `consent.review` | 保護者同意審査時 |
| `post.create` / `post.delete` | 投稿の作成・削除時 |
| `comment.create` / `comment.delete` | コメントの作成・削除時 |
| `report.create` / `report.resolve` | 通報の作成・対応時 |
| `room.create` / `room.approve` | ルーム作成申請・承認時 |
| `event.create` / `event.stop` | イベント作成・強制停止時 |
| `consultation.book` / `consultation.cancel` | 相談予約・キャンセル時 |
| `mentor.approve` / `mentor.reject` | メンター審査時 |
| `moderation.flag` | モデレーションで違反検出時 |
| `admin.ng_word.create` / `update` / `delete` | NGワード変更時 |

---

## 9. ファイルディレクトリ構成（API 関連）

```
src/
  app/
    api/
      v1/
        auth/
          register/route.ts
          login/route.ts
          logout/route.ts
          password-reset/route.ts
          password-reset/confirm/route.ts
          callback/route.ts
          resend-verification/route.ts
        verification/
          status/route.ts
        consent/
          status/route.ts
        tags/route.ts
        onboarding/
          recommendations/route.ts
        feed/
          route.ts
          recommendations/route.ts
        posts/
          route.ts
          [id]/
            route.ts
            comments/route.ts
        rooms/
          route.ts
          [id]/
            route.ts
            members/route.ts
            profile/route.ts
        events/
          route.ts
          [id]/route.ts
        mentors/
          route.ts
          [id]/
            route.ts
            slots/route.ts
        consultations/
          route.ts
          [id]/route.ts
        ai/
          chat/
            route.ts
            history/route.ts
          profile/
            generate/route.ts
          moderation/
            check/route.ts
        users/
          me/route.ts
          [id]/route.ts
        notifications/route.ts
        admin/
          verifications/
            route.ts
            [id]/route.ts
          consents/route.ts
          reports/
            route.ts
            [id]/route.ts
          mentor-applications/
            route.ts
            [id]/route.ts
          room-applications/route.ts
          events/route.ts
          ng-words/route.ts
          audit-logs/route.ts
    actions/
      verification.ts
      consent.ts
      onboarding.ts
      posts.ts
      comments.ts
      rooms.ts
      events.ts
      consultations.ts
      mentors.ts
      profile.ts
      notifications.ts
      admin/
        verification.ts
        consent.ts
        reports.ts
        mentors.ts
        rooms.ts
        events.ts
        ng-words.ts
  lib/
    auth/
      get-session.ts
      require-auth.ts
      require-role.ts
      require-age-verified.ts
    api/
      error-handler.ts
      response.ts
      rate-limit.ts
    moderation/
      check-content.ts
      ng-words.ts
    audit/
      log.ts
    validations/
      auth.ts
      posts.ts
      rooms.ts
      events.ts
      consultations.ts
```

---

## 10. 今後の拡張（MVP 後）

- AI チャットの実 LLM 接続（SSE ストリーミング対応）
- AI プロフィール生成の実 LLM 接続
- AI モデレーションの ML モデル導入
- リアルタイム通知（Supabase Realtime / WebSocket）
- ファイルアップロード API（Supabase Storage 連携）
- 外部 OAuth プロバイダー連携（Google, LINE 等）
- API バージョニング戦略の強化
