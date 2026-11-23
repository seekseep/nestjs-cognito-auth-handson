# AGENTS.md - プロジェクト方針

## プロジェクト概要

NestJS で、ノートの作成・一覧・削除の API を作り、Amazon Cognito のトークンで認証（作成と削除はログインした人だけ）と
認可（削除は作った人だけ）を足していくハンズオン教材。一覧は誰でも見られる。
もとは 1 本の大きなハンズオン（Next.js + NestJS + Cognito + Podman）を 3 本に分けたうちの B。

| | ハンズオン | リポジトリ |
|---|---|---|
| A | 基本的な REST API | `seekseep/nestjs-rest-api-handson`（元の `nest-js-and-cognito-handson` を改名） |
| **B** | **認証と認可（このリポジトリ）** | `seekseep/nestjs-cognito-auth-handson` |
| C | テスト | `seekseep/nestjs-testing-handson` |

**どれから始めても進められる** ことが大事な条件。B は 02 章で `nest new` から API を作るので、A を終えていなくても始められる。
構成と本文の書き方は **A にそろえる**（章の最初の節での章の説明、genfig の図、「動作確認する」、`curl -i` と「〜になれば大丈夫です」、
「参考にした公式ドキュメント」、FAQ、README の章ごとの見出し）。

handson-builder スキルの骨格（`sections/` ＋ Starlight の `site/` ＋ GitHub Pages）を使っている。
全体の計画と方針の正本は GitHub のイシュー #1。

## 用語：章（セクション）と節（レクチャー）

| 用語 | 指すもの | 例 |
|---|---|---|
| **章** | `sections/<NN-section>/`。章立ては固定（イシュー #1） | `05-authentication/` |
| **節** | `sections/<NN-section>/<NN-lecture>/`。増減してよい | `05-authentication/03-require-token/` |

- 章立て: 01 準備 / 02 Hello World（NestJS・Podman で API と nginx）/ 03 設計する（ノートの API・認証・認可。OpenAPI は使わず表と図だけ。コードは書かない）/
  04 実装する（SQLite と作成・一覧・削除。コントローラーに直接書く）/ 05 認証する / 06 認可する（認可の種類（本文だけ）→ 所有 → 役割（Cognito のグループ admin）→ 所属（SQLite の teams・team_members））/ 07 整理する（DatabaseModule → サービス → 認証の middleware。1 節で 1 つだけ分け、動きは変えない。認可はノートを読んでから決めるのでサービスに置き、Guard にはしない）/ 08 権限をどこで確かめるか（概要・API で確かめる（本文だけ）→ トークンに持たせる（Pre Token Generation V2 の Lambda、`teams` クレーム）→ 比べる（表と、はい・いいえのフローチャート））
- 節のディレクトリは **その節を終えた時点のプロジェクト** を丸ごと持つ（`compose.yaml` と `apps/`）
- 次の節は、前の節のディレクトリをコピーして差分を足して作る（`tools/copy-lecture.sh <前の節> <次の節>`）
- 本文は `LECTURE.md`（`docs: true`）。節の直下の `README.md` は ZIP を展開した人向けの起動方法
- 説明図は `images/` に置く。`00-thumbnail.svg` は `tools/thumbnail.mjs` の THUMBNAILS に足して `node tools/thumbnail.mjs`。
  ほかの図は genfig（`images/NN-xxx.py` → `.svg`）で作り、`xmllint --noout` を通し、描き出して目で確かめる。`text` のコードブロックで図（矢印・枠）を書かない
- 章の直下には README を置かない。章のラベルは `site/astro.config.mjs` の sidebar に書く
- 準備の節・設計の節（03 章・06-01・08-01・08-04）と、コードを変えない 08-02 は、プロジェクトを持たない（本文だけ）

## プロジェクトの形

```text
sections/<sec>/<lec>/
├── README.md         起動方法（ZIP に入る。::tree には出さない）
├── LECTURE.md        教材本文（ZIP に入らない）
├── images/           説明図（ZIP に入らない）
├── generated/        ::diff{base="generated"} の比べる相手（nest g の直後のファイル。ZIP に入らない）
├── compose.yaml      02-02 から（api は build: ./apps/api、web は ./apps/ui を配る。04-01 で SQLite のボリューム、05-01 で floci、08-03 で Lambda の設定）
└── apps/             API と画面を並べるモノレポ（ルートの package.json・npm workspaces は入れない）
    ├── api/          NestJS（npx @nestjs/cli@12 new api --package-manager npm --skip-git --skip-tests --type esm --no-observe --skip-skills。02-01 で apps/ の中に作る）
    │   ├── Dockerfile・.dockerignore             02-02 から
    │   ├── scripts/setup-cognito.mjs             05-01 から（ルートで node apps/api/scripts/setup-cognito.mjs。ルートの .env と apps/ui/config.json に書く。08-03 からルートの lambda.zip を読む）
    │   ├── scripts/team-member.mjs               06-04 から（podman compose exec api node scripts/team-member.mjs ...。コンテナの中で動かす）
    │   ├── lambda/index.mjs                      08-03 から（ルートで zip -j lambda.zip apps/api/lambda/index.mjs）
    │   └── src/
    │       ├── database.ts                       04-01 から（07-01 で database/ に移し、DatabaseModule のプロバイダーにする）
    │       ├── notes/                            notes.controller.ts（04-01 から）、notes.service.ts（07-02 から）
    │       └── auth/                             05-03 から verify-token.ts、07-03 で auth.middleware.ts
    └── ui/           画面（02-02 から）。nginx がこのフォルダをそのまま配る。HTML と同じ名前の .js の組。共通の部品は lib/、見た目は style.css
```

- 言語は **TypeScript**。NestJS 12（ESM。import の末尾は `.js`）。パッケージマネージャはレクチャー側が **npm**、サイトが pnpm
- コマンドは、Podman・スクリプト・`zip`・`.env` への書き足しはルート、npm と Nest CLI は `apps/api/` で実行する（本文では `cd apps/api` → … → `cd ../..` の形で書く）
- `apps/api/` は、`nest new api --skip-git` の質問に npm・observe は n・skills は none・ESM と答えて作ったもの（`nest new api --skip-git --package-manager npm --no-observe --skip-skills --type esm` と同じ。`--skip-tests` は付けないので `src/app.controller.spec.ts`・`test/app.e2e-spec.ts` もある）を何も消さずに使う。02-01 は質問に答える形で書き、1 行で作るコマンドを添える
  （`AGENTS.md`・`README.md`・oxlint・Prettier・Vitest の設定とパッケージ・`scripts` もそのまま。A と同じ）。`@nestjs/testing` があるので、`nest g controller`・`nest g service` には `--no-spec` を付ける
- ポート: web（nginx、`apps/ui/` を配る）は `127.0.0.1:3000:80`、api は `127.0.0.1:3001:3000`、Floci は `127.0.0.1:4566`。
  API は `enableCors({ origin: 'http://localhost:3000' })`、Floci は `FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000`
- ノートは SQLite（`node:sqlite` の `DatabaseSync`）の `notes` テーブル。項目は A と同じ（`id`・`title`・`body`・`createdAt`・`updatedAt`）に `ownerId`（認証を足すまでは `null`）。
  ファイルは `DB_PATH`（compose で `/data/notes.db`、ボリューム `db`）。入力チェックはしない
- API はコンテナで `node dist/main.js`。コードを変えたら `podman compose up -d --build --wait`。画面（`apps/ui/`）は nginx がそのまま配るので作り直さなくてよい
- `.env`（プロジェクトのルート）と `apps/ui/config.json` は Git に入れない（リポジトリのルートの `.gitignore`）。`.env` は `apps/api/` の外なのでイメージにも入らない。`node apps/api/scripts/setup-cognito.mjs`（ルートで）が
  `.env`（`COGNITO_USER_POOL_ID`・`COGNITO_CLIENT_ID`）と `apps/ui/config.json`（`issuer`・`clientId`）を書く。画面は `apps/ui/lib/config.js` で `config.json` を読む。
  書いたあと `podman compose up -d --wait` で API を作り直す（`env_file` を読ませる）
- ユーザーは画面でサインアップする（`SignUp` → `ConfirmSignUp`）。確認コードは Floci の SES の受信箱 `http://localhost:4566/_aws/ses` で読む
- 06-03 から、`setup-cognito.mjs` がグループ `admin` と `admin@example.com`（`Passw0rd!`）を作る。06-04 から、チームの所属は `podman compose exec api node scripts/team-member.mjs add|remove <メール> <チーム>`（Cognito でメールから `sub` を引き、SQLite の `team_members` に書く）
- Floci は `FLOCI_BASE_URL=http://floci:4566` にして、トークンの `iss` を API のコンテナから届く `http://floci:4566/<プール ID>` にしている
- トークンの検証は aws-jwt-verify の `JwtVerifier`（`CognitoJwtVerifier` は発行元が amazonaws.com に固定なので使えない）。
  `jwksUri` は `iss` の下の `/.well-known/jwks.json`、`token_use`・`client_id` は `customJwtCheck`。既定の JWKS の取得は https だけなので、
  `SimpleJwksCache` に `fetch` の fetcher を渡す
- 作成・削除は curl（ログイン画面に出したアクセストークンを付ける）で呼び、結果は一覧の画面（`/notes.html`、トークン無し）を読み込み直して見る
- 08-03 の Lambda: Floci は Lambda をコンテナで動かすので、floci に Podman のソケット（`${PODMAN_SOCKET}:/var/run/docker.sock`、場所は `podman info --format '{{.Host.RemoteSocket.Path}}'` を `.env` に書く）と
  `security_opt: label=disable` を渡し、`FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK: notes`（compose の `networks.default.name`）と `FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE: floci` を付ける。
  関数（`lambda/index.mjs`、`nodejs22.x`）は `lambda.zip`（`zip -j` / `Compress-Archive`）を `setup-cognito.mjs` が `POST /2015-03-31/functions` で作り、`CreateUserPool` の `LambdaConfig.PreTokenGenerationConfig`（`V2_0`）に付ける。
  Lambda は `http://api:3000/teams?userId=<sub>` で所属を聞き、`claimsAndScopeOverrideDetails.accessTokenGeneration.claimsToAddOrOverride.teams` に載せる。`setup-cognito.mjs` は `.env` の `PODMAN_SOCKET` の行を残して書き直す
- **秘匿情報（ユーザープール ID・クライアント ID・AWS アカウント ID・キー）の実値は絶対にコミットしない**

## 本文の分量

- **重要な要素だけを理解させる**。「あったら良い」説明は書かない
- 手順は 1 通りに絞る。選択肢・別解（別のインストール方法、CLI での作り方など）を並べない
- 書かないもの: 任意の道具や別のやり方の紹介、「〜でもかまいません」、豆知識、コラム、長い歴史や背景、同じことの言い直し、流れに要らない表
- `::diff` の下の箇条書きは、そのコードを読むのに欠かせない点だけ
- `:::faq` は、手順どおりに進めても本当につまずく問題だけ。無ければ `:::faq` ごと書かない
- 残すもの: その節の重要な要素、打つコマンドと期待する出力、`::diff`、動かして確かめる手順、本番で危ないことへの警告、
  「参考にした公式ドキュメント」、`::tree`、`:::download`

## 本文の書き方（センチネル）

- コードの変更は `::diff{file="apps/api/src/main.ts"}` で示す。前の節の同じファイルとの差分を実ファイルから生成する
  （`site/scripts/libs/project-diff.mjs`）。新規ファイルは全行 `+`。本文にコードを手で二重に書かない
  - `::diff[どこを書き換えるか]{file="..."}` で説明を付けられる
  - `::diff` は先頭に「`apps/api/src/main.ts` を変更する」の見出しを自動で付ける（前の節に無ければ「作成する」、
    この節で消したなら「削除する」。漢字で書く）。見出しの深さは直前の見出しより 1 つ深い。
    本文に「`...` を作ります」のような、見出しと重なる文は書かない
  - 比べる相手を変えるときは `from="<sec>/<lec>"`、前の節でのファイル名が違うときは `fromFile="..."`
  - 本文のコマンド（`npm install` など）が作った・書き換えたファイルに手で書き足すときは、コマンドの直後のファイルを
    節の `generated/<file>` に置き、`base="generated"` で比べる（`generated/` は ZIP・`::tree` に入らない）
  - コマンドが作った・書き換えた結果を見せるだけの差分には `by="command"` を付ける。見出しが「`...` が作られる／が変わる／が消える」になり、
    手で書く手順（「作成する／変更する／削除する」）と見分けられる
- ページの最後は「参考にした公式ドキュメント」→「この節を終えたときのディレクトリ」見出し → `::tree` → `:::download` ＋ `[...](./project.zip)` → `:::faq`
  - `::tree` は、その節のプロジェクト全体をエディタ（左にツリー、右にコード）で見せる。前の節から追加・変更したファイルに「作成」「変更」の印、変更したファイルの足した行に色を付ける。`package-lock.json` と画像は中身を省く
- コマンドの実行例は普通のコードブロックで書く
- 「参考にした公式ドキュメント」は `- [名前](URL) … 何を参考にしたか` の形で並べる。リンクは開けることと、書いた中身が本当にそのページにあることを確かめてから載せる
- よくある質問は `:::faq`、注意は `:::warning` / `:::danger` / `:::notice`
- 手順が OS で分かれるところは `:::::platform` で囲み、中を `::::macos` / `::::windows` / `::::linux`（`::::macos-linux` のように `-` でつなぐと両方に出す）に分ける
  - Windows は PowerShell 7 の手順を書く（WSL は使わない）。bash のコマンドで PowerShell では動かないもの（`\` の改行・`/dev/null`・`export`・`rm -rf`・`VAR=値 コマンド` など）は、`::::macos-linux` と `::::windows` に分ける
  - 選んだ OS は localStorage（キー `handson-os`）に残り、ナビゲーションバーの選択欄と `::platform-choice`（01-01 に置いている）で変える
  - パネルの中に見出し（`##`・`###`）は書かない（目次に残って、隠れた所を指してしまう）
- 「次へ」の見出しやリンクは書かない（Starlight の前へ／次へと重複するため）

## 図（genfig）

- 図は genfig スキルで作る。genfig は `seekseep/genfig-skill` を **サブモジュール** として `.claude/skills/genfig` に入れている。clone は `git clone --recurse-submodules`、clone 済みなら `git submodule update --init` で取ってくる
- 各節の `images/NN-xxx.py` は、ファイルの場所から上へたどって `.claude/skills/genfig` を読み込む。`images/` の中で `python3 NN-xxx.py` を実行すると、同じ名前の `.svg` を書き出す
- genfig を直すときは genfig-skill のリポジトリに PR を出し、マージしてからサブモジュールを更新して図を描き直す
- SVG は `xmllint --noout` を通し、描き出して目で確かめる

## サイト（site/）の開発

パッケージマネージャは **pnpm**（`site/package.json` の `packageManager` で固定）。

```sh
cd site
pnpm install
pnpm run dev      # http://localhost:4321（predev で previews / sync / downloads が走る）
pnpm run build    # 本番ビルド
```

- ZIP・`::tree`・`::diff` は `git ls-files --cached --others --exclude-standard` の結果を使う。
  `.gitignore` 済みのもの（`node_modules/`・`dist/`・`.env`）は入らない
- 依存を上げ直すときに踏みやすい点（esbuild の allowBuilds、archiver 8 の `ZipArchive`、Astro 7 の
  `@astrojs/markdown-remark`）は `.claude/handson-builder-conventions.md` を参照

## サイトへの公開ルール

- frontmatter に `docs: true` を持つマークダウンだけが `site/scripts/sync-lectures.mjs` に拾われる
- 文章は必ず `sections/` 側に書く。`site/src/content/docs/` は自動生成なので直接編集しない
- 相対リンクは sync スクリプトが自動変換する（他の節 → サイト内 URL、ソースコード → GitHub blob、
  画像 → GitHub raw、`./project.zip` → その節の ZIP、`./start.zip` → 前の節の ZIP）

## 進め方（このリポジトリ）

- 章ごとにブランチを切って PR を作る。ビルドが通ることを確かめてからマージしてよい
- 方針が変わったらイシュー #1 の本文を更新する
