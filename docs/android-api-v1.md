# Android向けJSON API v1（開発用）

この契約は架空学生と架空企業のデモ用です。AndroidとWebは同じNext.jsサーバーを利用します。AndroidからMySQLへ直接接続しません。Web画面のブラウザー保存データは、このAPIへ自動移行されません。

## 認証と共通形式

- AndroidはBetter Authの `POST /api/auth/sign-up/email` または `POST /api/auth/sign-in/email` を使用します。登録できるメールは開発用の `@example.com` のみです。
- 成功応答の `set-auth-token` ヘッダーを取得し、後続のリクエストへ `Authorization: Bearer <token>` を付けます。トークンは端末内で安全に管理し、URL・ログへ出しません。ブラウザーは既存のCookieセッションを使用します。
- 認証が必要なAPIは、セッションから利用者IDを取得して本人の行だけを読み書きします。クライアントから利用者IDを受け取りません。
- JSON本文は `Content-Type: application/json`。エラーは `{ "error": "説明" }`。入力不正は400、認証切れは401、他人の診断IDは404です。認証が必要なGETは `Cache-Control: private, no-store` を返します。
- 開発用Androidエミュレーターでは `adb reverse tcp:3000 tcp:3000` を設定し、アプリから `http://127.0.0.1:3000` に接続します。Windows側で `10.0.2.2` への接続がタイムアウトしたため、この経路を採用します。本番ではHTTPSの接続先を設定します。

## エンドポイント

学生プロフィールは `GET /api/v1/profile` と `PUT /api/v1/profile` で扱います。GET は認証が必要で、未登録なら `{ "profile": null, "options": { "prefectures": [...], "schoolTypes": [...], "genders": [...] } }` を返します。PUT は卒業年 `graduationYear`、学校種別 `schoolType`、年齢 `age`、学校名 `schoolName`、専攻 `major`、性別 `gender`、趣味 `hobbies`、希望勤務地 `workLocation`、最低月給（円）`minimumMonthlySalaryYen` を受け取り、プロフィールと希望条件を同一トランザクションで保存します。認証対象の本人の情報のみ取得・更新できます。

| 操作 | メソッドとURL | 入力 | 成功応答 |
| --- | --- | --- | --- |
| 設問一覧 | `GET /api/v1/questions` | なし | `{ "questions": [{ "id", "title", "choices" }] }`。選択肢は1〜5の順 |
| 希望条件の取得 | `GET /api/v1/conditions` | 認証 | `{ "conditions": null }` または条件オブジェクト |
| 希望条件の保存 | `PUT /api/v1/conditions` | `{ "workLocation": "東京都", "minimumMonthlySalaryYen": 250000 }` | `{ "conditions": ... }` |
| 診断実行 | `POST /api/v1/diagnoses` | `{ "answers": { "質問ID": 1〜5, ... } }` | `201` と `{ "diagnosisId": "UUID", "recommendations": [...] }` |
| 診断結果 | `GET /api/v1/diagnoses/{diagnosisId}` | 認証 | `{ "diagnosisId", "recommendations": [...] }` |
| 最新の診断結果 | `GET /api/v1/diagnoses/latest` | 認証 | `{ "diagnosis": null }` または診断結果 |
| 提案企業の詳細 | `GET /api/v1/diagnoses/{diagnosisId}/companies/{companyId}` | 認証 | `{ "company": { "id", "name", "location", "monthlySalaryYen", "difference", "reasons", "details", "sourceUrl", "verifiedAt", "applicationUrl" } }` |
| 保存企業一覧 | `GET /api/v1/saved-companies` | 認証 | `{ "companies": [{ "id", "name", "diagnosisId" }] }` |
| 提案企業の保存 | `POST /api/v1/saved-companies` | `{ "diagnosisId", "companyId" }` | `{ "saved": true, "companyId", "diagnosisId" }` |
| 旧保存企業の詳細 | `GET /api/v1/saved-companies/{companyId}` | 認証 | `{ "company": ... }`。紐づく診断がない場合も表示でき、理由は空一覧 |

希望勤務地は都道府県名、最低月給は**円の整数またはnull**です。未登録の条件は `null` とします。診断実行では、保存済みの本人の希望条件を使います。回答は既存の12問のIDを全て指定します。通勤距離は既存デモ判定と同様、点差の集計対象外です。候補がなければ `recommendations: []` を正常応答として返します。提案には `id`、`name`、`difference`、`reasons` を含み、既存のデモ判定と同じ企業順にします。

企業詳細と保存企業は架空のデモ企業だけを扱います。詳細の `details` には飲み会、新卒配属、転勤、リモート、有給、休日連絡、社内イベント、3年以内離職率、新卒がギャップを感じやすい点を含み、未確認の値は `null` です。出典URL・確認日・公式応募先URLも、現行デモ企業では `null` です。実在企業の情報と企業担当者の登録・公開は、この契約に含めません。
