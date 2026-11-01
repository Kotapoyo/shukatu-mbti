# 企業MBTI Android版

学生プロフィールの全項目を利用する場合は、既存のAndroid向けマイグレーションに続けて `web/` で `node scripts/migrate-student-profile.mjs` を一度実行してください。プロフィールと希望条件は同じ保存操作でMySQLへ反映されます。

Android Studioでこの `android/` フォルダーを開き、Gradleの同期後に `app` を実行します。最低対応OSはAndroid 8.0（API 26）です。エミュレーターまたは実機で起動できます。

Androidのデバッグ版からローカルAPIへ接続するには、先に `web/` で `npm.cmd run dev` を起動し、エミュレーターが起動した状態で `adb reverse tcp:3000 tcp:3000` を実行します。`adb` がPATHにない場合はAndroid SDKの `platform-tools/adb.exe` を使用してください。エミュレーターを再起動した場合は `adb reverse` をもう一度実行します。デバッグ版の接続先は `http://127.0.0.1:3000` です。

PowerShellからデバッグAPKを作成する場合は、Android SDKの場所を `ANDROID_HOME` に設定してから、`android/` で `./gradlew.bat :app:assembleDebug` を実行します。出力先は `app/build/outputs/apk/debug/` です。Android Studioから開いた場合は、IDEが作る `local.properties` でもSDKの場所を指定できます。

架空メールによる新規登録・ログイン、希望勤務地・最低月給の保存、12問の診断、最新の提案結果、架空企業の詳細と保存一覧を利用できます。診断にはWebと同じサーバー側の判定を使用します。初回セットアップでは、Webの認証用テーブルと `web/db/001_saved_company.sql` の後に、`web/` で `node scripts/migrate-android-api.mjs`、続けて `node scripts/migrate-saved-diagnosis.mjs` を一度ずつ実行してください。API契約は `docs/android-api-v1.md` を参照してください。

セッショントークンはAndroid Keystoreの鍵で暗号化し、端末内のアプリ専用領域に保存します。画面回転後は診断の回答を維持し、アプリの再起動後は保存済みセッションを検証してホームへ戻ります。ログアウトや認証失効時は保存済みトークンを削除します。色・キャラクター画像・ホームの3ステップ・診断の5段階選択はWeb版のデザインに合わせています。実在学生・企業の情報、公式応募先、企業情報登録は対象外です。アプリIDの `com.example.shukatumbti` は開発用で、配布前にチームで確定します。
