# Git操作手順

このリポジトリでは、`main`から作業用ブランチを作成し、変更をpushした後、GitHubのPull Request（PR）で`main`へ取り込む流れを基本とします。
以下のコマンドは、リポジトリのフォルダ内で実行してください。ブランチ名とファイル名は、自分の作業に合わせて置き換えます。

## ブランチの切り方

1つの作業につき1つのブランチを作成します。名前は「種類/作業内容」とし、作業内容には英小文字とハイフンを使います。

| 用途 | ブランチ名の例 |
| --- | --- |
| 機能の追加 | `feat/result-page` |
| 不具合の修正 | `fix/score-calculation` |
| ドキュメントの更新 | `docs/git-workflow` |
| 動作を変えないコード整理 | `refactor/question-data` |
| 開発設定などの整備 | `chore/editor-settings` |

`main`は取り込み先として使い、実装や修正は作業用ブランチで行います。関係のない変更は別のブランチに分けます。

### 新しい作業を始める場合

まず、現在のブランチと未コミットの変更を確認します。

```powershell
git status
git branch --show-current
```

未コミットの変更がある場合は、現在の作業としてcommitするか、後述のstashで一時保存してから進めます。

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/result-page
```

これで、最新の`main`から`feat/result-page`を作成し、そのブランチへ切り替えられます。`pull --ff-only`が失敗した場合は、その場で止めて`git status`を確認します。変更を捨てて続行しないでください。

### 既存の作業を再開する場合

新しいブランチは作らず、前回のブランチへ戻ります。切り替え前には`git status`で未コミットの変更を確認してください。

```powershell
git switch feat/result-page
```

すでにpush済みで追跡先が設定されている場合は、リモートの変更を取得します。

```powershell
git pull --ff-only
```

ローカルにブランチがなく、リモートにだけ存在する場合は、次の手順で取得します。

```powershell
git fetch origin
git switch --track origin/feat/result-page
```

既存の`murata`ブランチで作業を続ける場合は、`git switch murata`で切り替えます。新しい作業を始める場合は、上記の命名例に沿って`main`からブランチを作成してください。

## 毎回の変更・commit・push

### 1. 変更内容を確認する

ファイルを編集し、変更に対応する動作確認やテストを実施してから、差分を確認します。

```powershell
git status
git diff
```

新規ファイルの内容は`git diff`には表示されないため、ファイルを開くか、次のステージ後の差分で確認します。

### 2. commitするファイルを選ぶ

今回の作業に含めるファイルだけを指定します。以下は`git.md`を更新した場合の例です。

```powershell
git add -- git.md
git diff --cached
git diff --cached --check
```

`git diff --cached`で、意図した変更だけが入っていることを確認してください。誤って追加したファイルは、`git restore --staged -- ファイル名`でステージから外せます。ファイルの編集内容は残ります。

### 3. commitする

メッセージには、`feat:`、`fix:`、`docs:`などの種類と変更内容を書きます。

```powershell
git commit -m "docs: Git操作手順を追加"
```

1回のcommitには、説明できるまとまりの変更を含めます。

### 4. pushする

ブランチを初めてpushする場合は、`-u`で追跡先を設定します。

```powershell
git push -u origin feat/result-page
```

同じブランチの2回目以降は、次のコマンドでpushできます。

```powershell
git push
git status
```

pushが拒否された場合は、エラーを確認してリモートとの差分を調べます。強制pushで上書きしないでください。

## PRの作成と取り込み後の操作

1. GitHubでpushしたブランチからPRを作成します。
2. 取り込み先（base）を`main`、変更元（compare）を作業用ブランチに設定します。
3. PRには変更内容と確認したことを記載し、差分とチェック結果を確認します。
4. レビューで修正が必要になった場合は、同じブランチで編集、commit、pushします。PRにも変更が反映されます。
5. レビューと必要なチェックが完了したら、PRをマージします。

マージ後は、手元の`main`を更新します。切り替え前に、未コミットの変更がないことを確認してください。

```powershell
git switch main
git pull --ff-only origin main
```

作業ブランチを削除する場合は、対象のPRがマージ済みで、未反映の作業が残っていないことを確認してから実行します。

```powershell
git branch -d feat/result-page
```

Squash mergeなどでは、マージ済みでも`-d`で削除できない場合があります。その場合は強制削除せず、PRと差分を確認するまでブランチを残します。リモートのブランチは、必要に応じてマージ済みPRの「Delete branch」から削除します。

## 作業途中の一時保存

commitする前に別のブランチへ移る必要がある場合は、stashを使います。`-u`は新規の未追跡ファイルも保存しますが、`.gitignore`で除外されたファイルは含みません。

```powershell
git stash push -u -m "result-pageの作業途中"
git stash list
```

元のブランチへ戻ってから、一覧で対象を確認し、一時保存を復元します。`stash@{0}`は最新のstashです。

```powershell
git switch feat/result-page
git stash apply 'stash@{0}'
git status
```

復元内容に問題がないことを確認した後、使ったstashを削除します。

```powershell
git stash drop 'stash@{0}'
```

競合が発生した場合はstashを削除せず、対象ファイルを修正してから差分を確認します。
