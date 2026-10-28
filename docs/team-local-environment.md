# チームメンバー向けローカル環境構築手順（Windows）

各自のPCでWeb版を動かすための手順です。リポジトリの取得やブランチ操作は含みません。コマンドは PowerShell で実行します。DBには開発用の架空データだけを入れてください。

## 用意するもの

- [Node.js 24 LTS](https://nodejs.org/en/download) と同梱の npm。この手順の作成時点で確認した版は Node.js 24.22.1 です。
- [MySQL Community Server 8.4 LTS](https://dev.mysql.com/downloads/mysql/8.4.html?os=3)。この手順の作成時点で確認した版は 8.4.13 です。Windows版の MySQL Workbench があると、SQLファイルを開いて実行しやすくなります。
- ローカルで使う MySQL の管理者パスワード、アプリ専用ユーザーのパスワード、Better Auth の秘密鍵。各自が別々の値を設定します。チームのチャットやリポジトリへ送らないでください。

インストール後に `node --version` と `npm.cmd --version` を実行し、Node.js が 24 系であることを確認します。PowerShell で `npm` がスクリプト実行ポリシーに止められる場合も、以降の `npm.cmd` をそのまま使えます。

## MySQL の起動とポート

MySQL 8.4 をインストールし、MySQL Configurator で Windows サービスとして構成します。初めて MySQL を入れるPCでは TCP ポートを `3306` にします。既に別の MySQL が 3306 番を使っているPCでは、8.4 を別サービス・別データ領域に追加し、空いているポートを選びます。村田のPCでは `MySQL84` を `3307`、既存の `MySQL90` を `3306` で動かしています。既存サービスのデータ領域を新しい8.4に指定しないでください。別インスタンスの設定例は [MySQL 公式マニュアル](https://dev.mysql.com/doc/refman/8.4/en/multiple-windows-services.html)にあります。

サービスの状態を確認します。サービス名が異なる場合は、実際の名前に読み替えてください。

```powershell
Get-Service *mysql*
```

インストールとポート設定の詳細は、[MySQL 8.4 の Windows 向けインストール手順](https://dev.mysql.com/doc/refman/8.4/en/windows-installation.html)を参照してください。3307 番ポートは全員共通の指定ではありません。

## アプリ用DBとユーザー

MySQL Workbench で、各自が設定した MySQL 8.4 のポートへ管理者として接続します。リポジトリ内の `web/db/create-database.sql` を実行し、`shukatu_mbti` を作ります。既に同名のDBがある場合は、内容を確認してから進めてください。

続いて、以下のSQLのパスワードを各自の強い値に置き換えて実行します。アプリは管理者 `root` で接続しません。

```sql
CREATE USER 'shukatu_app'@'127.0.0.1' IDENTIFIED BY '<各自のアプリ専用パスワード>';
GRANT ALL PRIVILEGES ON shukatu_mbti.* TO 'shukatu_app'@'127.0.0.1';
```

同名のユーザーが既にある場合は `CREATE USER` を再実行せず、接続先と権限を確認します。パスワードをSQLファイルに保存したり、コマンド引数に書いたりしないでください。

## `web/.env.local`

リポジトリ直下で `Copy-Item .\web\.env.example .\web\.env.local` を実行し、作成した `web/.env.local` に各自の値を入力します。既にファイルがある場合は上書きせず、内容を確認してください。このファイルは Git 管理外です。

```dotenv
BETTER_AUTH_SECRET=<32文字以上のランダムな秘密鍵>
BETTER_AUTH_URL=http://localhost:3000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=<各自のMySQL 8.4のポート。例: 3306 または 3307>
MYSQL_USER=shukatu_app
MYSQL_PASSWORD=<直前に設定したアプリ専用パスワード>
MYSQL_DATABASE=shukatu_mbti
```

秘密鍵の生成例は次のコマンドです。`BETTER_AUTH_SECRET` と MySQL のパスワードには別々の値を使います。

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

`BETTER_AUTH_URL` は実際に開くURLとポートを合わせます。Webアプリが MySQL に接続するときに読むのは `web/.env.local` です。ブラウザーやAndroidアプリにはDBの接続情報を設定しません。

## テーブルの作成

リポジトリ直下から次を実行します。認証用マイグレーションの確認が出たら、作成対象が `user`、`session`、`account`、`verification` の4テーブルであることを確認して進めます。既存DBでは、変更内容を確認せずに再実行しないでください。

```powershell
Set-Location .\web
npm.cmd ci
npx.cmd --cache .\out\npm-cache auth@1.7.14 migrate --config .\src\lib\auth.ts
```

Workbench でアプリ専用ユーザーとして `shukatu_mbti` に接続し、`shukatu_mbti` を既定のスキーマに選択して `web/db/001_saved_company.sql` を実行します。これは認証用の `user` テーブルができた後に、初回だけ実行します。`SHOW TABLES;` で `user`、`session`、`account`、`verification`、`saved_company` があることを確認します。

## 起動と確認

`web/` の PowerShell で起動します。2回目以降は通常、DB作成とマイグレーションを繰り返す必要はありません。

```powershell
npm.cmd run typecheck
npm.cmd run dev
```

ブラウザーで `http://localhost:3000` を開きます。開発中の新規登録には `student@example.com` のような未使用の架空メールと開発専用パスワードを使ってください。実在する氏名、メールアドレス、使い回しのパスワードは入力しません。

画面が開かない場合は開発サーバーの出力を確認します。新規登録や企業保存が失敗する場合は、MySQLサービスの起動、`MYSQL_PORT` とサービスのポートの一致、`MYSQL_USER` の権限、上記5テーブルの有無を順に確認します。3000 番以外でWebアプリを起動する場合は、`BETTER_AUTH_URL` も同じURLに変更します。

現状、認証情報と保存した既存の架空企業は MySQL に保存します。学生プロフィールと画面から登録したデモ企業はブラウザー内、診断回答はタブ内に保存します。別のPCへそれらのブラウザーデータは自動で移りません。詳しくは [README](../README.md#開発用の認証mysql-設定)を参照してください。
