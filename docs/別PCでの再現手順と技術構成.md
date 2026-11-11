# 別PCでの再現手順と技術構成

この文書は、別のWindows PCでCodexが企業MBTIの開発環境を再現するための引き継ぎ資料です。作業対象は`murata`ブランチです。`main`へマージしません。着手前にリポジトリ直下の`AGENTS.md`と`README.md`を読み、既存の未コミット変更を保持してください。

> **同期時の確認**：別PCでは`git fetch origin`の後に`git log -1 origin/murata`で取得した版を確認してください。作業ツリーに未コミット変更がある場合は、その内容を保持してから同期します。秘密情報を含む`web/.env.local`、`android/local.properties`、DBデータはGitへ入れません。

## Codexに渡す指示

```text
企業MBTIのmurataブランチを担当します。最初にAGENTS.md、README.md、
docs/別PCでの再現手順と技術構成.mdを読んでください。
既存の未コミット変更を上書きせず、mainにはマージ・プッシュしないでください。
技術構成はpackage.json、Gradle設定、実装コードを正として確認してください。
Windows PowerShellで依存関係、MySQL、Web/API、必要ならAndroidを起動し、
コマンドの終了結果と画面またはHTTPの確認結果を分けて報告してください。
環境変数の値やパスワードは出力・コミットしないでください。
```

## 必要な環境

| 項目 | このPCで確認した構成 | 用途 |
| --- | --- | --- |
| OSとシェル | Windows、PowerShell | 以下のコマンド例 |
| Node.js / npm | 24.19.0 / 11.17.0 | Web/API、移行スクリプト |
| MySQL | ローカルMySQL 8.0.45、ポート3306 | 認証とAndroid向けデータ |
| Android Studio | Android SDK 37、API 26以上の端末・エミュレーター | Android版を確認する場合 |
| Java / Gradle | Android Studio同梱JDK、Gradle Wrapper 9.5.0 | Androidのビルド |

Node.jsとnpmの数値は、このPCで動作確認した値です。依存パッケージは`web/package-lock.json`に従い、`npm ci`で入れます。MySQLの接続先、ユーザー、パスワードは各PCで用意してください。

## 技術選定と使用箇所

| 技術 | 選定理由 | 実際の使用箇所 |
| --- | --- | --- |
| TypeScript、Next.js 16.4.2、React 19.3.1 | Web画面とサーバーAPIを同じプロジェクトで管理し、型検査で画面とAPIの変更を確認できる | `web/src/app/`の各画面、`web/src/app/api/`のRoute Handlers、`web/tsconfig.json` |
| Tailwind CSS 4、CSS Modules | 共通の色・文字を定義し、画面専用のスタイルを分離できる | `web/src/app/globals.css`の`@theme`、各画面の`page.module.css` |
| Better Auth、Bearerプラグイン | WebはCookieセッション、Androidは署名を必須にしたBearerトークンで同じ認証基盤を使う | `web/src/lib/auth.ts`、`web/src/lib/auth-client.ts`、`web/src/app/api/auth/[...all]/route.ts` |
| MySQL 8.0、mysql2 | 利用者・診断・保存企業を外部キーで結び、APIで利用者ごとのデータを扱う | `web/src/lib/auth.ts`の接続プール、`web/db/*.sql`、`web/src/app/api/v1/` |
| 共通JSON API | AndroidとWeb側のサーバー処理で診断・提案の判定を共有し、Androidで判定を重複実装しない | `web/src/app/api/v1/`、`web/src/lib/api-v1.ts`、`web/src/app/diagnosis/recommendations.ts`、`docs/android-api-v1.md` |
| Kotlin 2.2.10、Jetpack Compose、Material 3 | Androidの画面を宣言的に実装し、Webと同じ色や操作の流れを表現する | `android/app/src/main/java/com/example/shukatumbti/AndroidApp.kt`、`Theme.kt` |
| Ktor Client 3.4.3 | AndroidのHTTP通信を一箇所にまとめる | `android/app/src/main/java/com/example/shukatumbti/ApiClient.kt` |
| Android Keystore、AES-GCM | Androidのセッショントークンとメールアドレスを端末内で暗号化する | `android/app/src/main/java/com/example/shukatumbti/SessionStore.kt` |
| Gradle Wrapper 9.5.0、Android Gradle Plugin 9.3.1 | Android StudioとCLIで同じビルド設定を利用する | `android/gradle/wrapper/gradle-wrapper.properties`、`android/build.gradle.kts`、`android/app/build.gradle.kts` |

現行の`web/package.json`には`shadcn/ui`や`Kysely`はありません。旧[`技術選定.md`](技術選定.md)にある両者の記述は初期案です。Webのプロフィールと画面から登録した企業はブラウザーの`localStorage`、診断回答は`sessionStorage`に保存します。Androidのプロフィール・希望条件・診断結果はAPI経由でMySQLに保存します。認証情報もMySQLに保存します。両方の画面からMySQLへ直接接続しません。

## WindowsでWeb/APIを再現する

1. リポジトリを取得して`murata`を選びます。既存のチェックアウトがある場合は、変更を消さずに状態を確認してください。

   ```powershell
   git clone --branch murata https://github.com/Kotapoyo/shukatu-mbti.git
   Set-Location .\shukatu-mbti
   git status -sb
   ```

2. MySQLを起動します。MySQL Workbenchなどで管理者として接続し、`web/db/create-database.sql`を実行します。続いて、アプリ専用ユーザーを作ります。既に作成済みなら繰り返さず、接続情報を確認してください。

   ```sql
   CREATE USER 'shukatu_app'@'127.0.0.1' IDENTIFIED BY '<ローカル専用のパスワード>';
   GRANT ALL PRIVILEGES ON shukatu_mbti.* TO 'shukatu_app'@'127.0.0.1';
   ```

3. `web/`で依存関係とローカル設定を用意します。`.env.local`には実際の接続情報を設定します。`BETTER_AUTH_SECRET`は32文字以上のランダムな値にし、`BETTER_AUTH_URL`を起動URLに合わせます。`.env.local`をGitへ追加しません。

   ```powershell
   Set-Location .\web
   npm.cmd ci
   Copy-Item .\.env.example .\.env.local
   # .env.localを編集: BETTER_AUTH_SECRET、MYSQL_USER、MYSQL_PASSWORDなど
   ```

4. **空のDBにだけ**、次の順でテーブルを作ります。`001_saved_company.sql`はWorkbenchでアプリ専用ユーザーとして実行します。各移行スクリプトは既存テーブルを検知すると停止するため、再実行前にDBの状態を確認してください。

   ```powershell
   npx.cmd auth@1.7.14 migrate --config .\src\lib\auth.ts
   # Workbenchで web/db/001_saved_company.sql を実行
   node .\scripts\migrate-android-api.mjs
   node .\scripts\migrate-saved-diagnosis.mjs
   node .\scripts\migrate-student-profile.mjs
   ```

   作成順は、Better Authの`user`等 → `saved_company` → `student_condition`・`diagnosis` → `saved_company.diagnosis_id` → `student_profile`です。既存DBを使う場合は、欠けている移行だけを適用してください。

5. Web/APIを起動します。PowerShellを開いたままにし、ブラウザーで`http://localhost:3000`を開きます。未ログインなら`/login`へ移動します。新規登録は`@example.com`の架空メールと専用パスワードを使います。実在の個人情報や使い回しのパスワードは入力しないでください。

   ```powershell
   npm.cmd run dev
   ```

   3000番ポートが使用中の場合は、別のプロセスが起動していないか確認します。ポートを変更するなら`BETTER_AUTH_URL`とAndroidのデバッグ用`API_BASE_URL`も合わせて変更してください。

## Androidを再現する場合

Android Studioで`android/`をプロジェクトとして開き、SDK 37を用意してGradleを同期します。ローカルAPIを起動した状態でエミュレーターを立ち上げ、次を実行します。`adb`がPATHにない場合はSDKの`platform-tools/adb.exe`を指定してください。

```powershell
adb reverse tcp:3000 tcp:3000
Set-Location ..\android
.\gradlew.bat --no-daemon :app:assembleDebug
```

デバッグAPKは`android/app/build/outputs/apk/debug/app-debug.apk`にできます。Android Studioの`app`実行設定からエミュレーターへ入れるか、`adb install -r`でインストールします。エミュレーターを再起動した場合は`adb reverse`を再設定します。現在のデバッグ版は`http://127.0.0.1:3000`へ接続します。

## 確認と引き継ぎ時の注意

```powershell
# web/で実行
npm.cmd run typecheck
npm.cmd run build
# 開発サーバーが起動し、移行が完了したDBに対して実行
node .\scripts\verify-android-api.mjs
```

API検証スクリプトは使い捨ての`@example.com`アカウント2件を作り、最後に削除します。実行に失敗した場合は、その出力とDB状態を確認してください。Webの表示はブラウザーでログイン、プロフィール、診断、提案結果、企業詳細を操作して確認します。Androidはビルド結果に加えてエミュレーターの画面とログイン・ログアウトを確認します。

再現できない場合は、`git status -sb`、Node/npmのバージョン、MySQLの接続とテーブル一覧、`.env.local`の**キー名だけ**、起動ログのエラー箇所を記録します。秘密値や認証トークンは共有しません。
