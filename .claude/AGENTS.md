# AGENTS.md - プロジェクト方針

## プロジェクト概要

NestJS で、ノートの作成・一覧・削除だけの小さな API を作り、Amazon Cognito のトークンで認証（作成はログインした人だけ）と
認可（削除は作った人だけ）を足していくハンズオン教材。一覧は誰でも見られる。
もとは 1 本の大きなハンズオン（Next.js + NestJS + Cognito + Podman）を 3 本に分けたうちの B。

| | ハンズオン | リポジトリ |
|---|---|---|
| A | 基本的な REST API | `seekseep/nestjs-rest-api-handson`（元の `nest-js-and-cognito-handson` を改名） |
| **B** | **認証と認可（このリポジトリ）** | `seekseep/nestjs-cognito-auth-handson` |
| C | テスト | `seekseep/nestjs-testing-handson` |

**どれから始めても進められる** ことが大事な条件。B は 02 章で `nest new` から API を作るので、A を終えていなくても始められる。

**最小限の構成** にする。コードは読んで分かる量にとどめる（単一取得・更新・入力チェック・グループ・Guard は作らない）。
Next.js・Amplify・OpenAPI は使わない。API と、Cognito のエミュレーター **Floci**（`docker.io/floci/floci:2.4.0`、ポート 4566）を
Podman（`podman compose`、プロバイダは docker-compose）で一緒に動かす。Node.js は `nest new` と、02-01 の手元での起動と、
`scripts/setup-cognito.mjs` に使う。

handson-builder スキルの骨格（`sections/` ＋ Starlight の `site/` ＋ GitHub Pages）を使っている。
全体の計画と方針の正本は GitHub のイシュー #1。

## 用語：章（セクション）と節（レクチャー）

| 用語 | 指すもの | 例 |
|---|---|---|
| **章** | `sections/<NN-section>/`。章立ては固定（イシュー #1） | `03-authentication/` |
| **節** | `sections/<NN-section>/<NN-lecture>/`。増減してよい | `03-authentication/03-require-token/` |

- 節のディレクトリは **その節を終えた時点のプロジェクト** を丸ごと持つ（`api/`）
- 次の節は、前の節のディレクトリをコピーして差分を足して作る（`tools/copy-lecture.sh <前の節> <次の節>`）
- 本文は `LECTURE.md`（`docs: true`）。節の直下の `README.md` は ZIP を展開した人向けの起動方法
- 説明図は `images/` に SVG で置く（`00-thumbnail.svg` を先頭サムネに。`tools/thumbnail.mjs` の THUMBNAILS に足して `node tools/thumbnail.mjs`）
- 章の直下には README を置かない。章のラベルは `site/astro.config.mjs` の sidebar に書く
- 準備の節や、コードを変えずに curl で確かめるだけの節（03-04・04-02・04-03）は、プロジェクトを持たない（本文だけ）

## プロジェクトの形

```text
sections/<sec>/<lec>/
├── README.md         起動方法（ZIP に入る。::tree には出さない）
├── LECTURE.md        教材本文（ZIP に入らない）
├── images/           説明図（ZIP に入らない）
└── api/              NestJS（npx @nestjs/cli@12 new api --package-manager npm --skip-git --type esm --no-observe --skip-skills から作った）
    ├── Dockerfile・.dockerignore・compose.yaml   02-02 から（03-01 で floci のサービスを足す）
    ├── scripts/setup-cognito.mjs                 03-01 から（ユーザープールとクライアントを作り、.env に書く）
    ├── public/                                   02-04 から notes.html（一覧の画面）、03-01 で cognito.js・signup.html、03-02 で login.html
    └── src/
        ├── app.controller.ts・app.service.ts     nest new のまま（03-01 で GET /config を足す）
        ├── notes/                                notes.controller.ts・notes.service.ts（AppModule に直接登録）
        └── auth/                                 03-03 から verify-token.ts、05-01 で auth.middleware.ts
```

- 言語は **TypeScript**。NestJS 12（ESM。import の末尾は `.js`）。パッケージマネージャはレクチャー側が **npm**、サイトが pnpm
- ポートは **3000**（API）と **4566**（Floci）。画面は NestJS が `public/` を `useStaticAssets()` で配る。画面から Floci を
  直接呼ぶので、Floci の `FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS` で `http://localhost:3000` を許している
- プロジェクトは **ビルドして動かすのに要るものだけ**。`nest new` が作るテスト（`test/`・`*.spec.ts`・Vitest。テストは C の範囲）、
  lint・format（oxlint・Prettier）、`AGENTS.md`・`README.md`・`.gitattributes` は 02-01 で消す（`npm uninstall`・`npm pkg delete`、
  `tsconfig.json` の `types` から `vitest/globals` を消す）。`package.json` のスクリプトは `build`・`start`・`start:dev` だけ
- ノートは `{ id, text }`（04-01 から `ownerId`）。メモリ上の配列。入力チェックはしない
- API はコンテナで `node dist/main.js`。コードを変えたら `podman compose up -d --build --wait`
- `.env` は Git にもイメージにも入れない。`node scripts/setup-cognito.mjs` が `COGNITO_USER_POOL_ID`・`COGNITO_CLIENT_ID` を書き、
  compose の `env_file`（`required: false`）で API に渡す。書いたあと `podman compose up -d --wait` で API を作り直す
- ユーザーは画面でサインアップする（`SignUp` → `ConfirmSignUp`）。ユーザープールは `AutoVerifiedAttributes: ['email']` で、
  確認コードは Floci の SES の受信箱 `http://localhost:4566/_aws/ses` で読む
- Floci は `FLOCI_BASE_URL=http://floci:4566` にして、トークンの `iss` を API のコンテナから届く `http://floci:4566/<プール ID>` にしている
- トークンの検証は aws-jwt-verify の `JwtVerifier`（`CognitoJwtVerifier` は発行元が amazonaws.com に固定なので使えない）。
  `jwksUri` は `iss` の下の `/.well-known/jwks.json`、`token_use`・`client_id` は `customJwtCheck`。既定の JWKS の取得は https だけなので、
  `SimpleJwksCache` に `fetch` の fetcher を渡す
- 作成・削除は curl（ログイン画面に出したアクセストークンを `TOKEN` に入れて付ける）で呼び、結果は一覧の画面（`/notes.html`、トークン無し）を読み込み直して見る。
  画面は一覧・サインアップ・ログインの 3 枚。`/notes.html` にして、`GET /`（Hello World）とぶつからないようにしている
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

- コードの変更は `::diff{file="api/src/main.ts"}` で示す。前の節の同じファイルとの差分を実ファイルから生成する
  （`site/scripts/libs/project-diff.mjs`）。新規ファイルは全行 `+`。本文にコードを手で二重に書かない
  - `::diff[どこを書き換えるか]{file="..."}` で説明を付けられる
  - `::diff` は先頭に「`api/src/main.ts` を変更する」の見出しを自動で付ける（前の節に無ければ「作成する」、
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
