# AGENTS.md - プロジェクト方針

## プロジェクト概要

NestJS のメモの REST API に、Amazon Cognito のサインインと、認証（トークンの検証）・認可（持ち主と admin グループ）を
足していくハンズオン教材。もとは 1 本の大きなハンズオン（Next.js + NestJS + Cognito + Podman）を 3 本に分けたうちの B。

| | ハンズオン | リポジトリ |
|---|---|---|
| A | 基本的な REST API | `seekseep/nestjs-rest-api-handson`（元の `nest-js-and-cognito-handson` を改名） |
| **B** | **認証と認可（このリポジトリ）** | `seekseep/nestjs-cognito-auth-handson` |
| C | テスト | `seekseep/nestjs-testing-handson` |

**どれから始めても進められる** ことが大事な条件。B は A を終えていなくても始められるように、02 章で「はじめのプロジェクト」
（メモの REST API と HTML 1 枚）を ZIP で配り、中身を短く説明する。

**最小限の構成** にする。Podman・compose・Next.js・Amplify・OpenAPI は使わない。

handson-builder スキルの骨格（`sections/` ＋ Starlight の `site/` ＋ GitHub Pages）を使っている。
全体の計画と方針の正本は GitHub のイシュー #1。

## 用語：章（セクション）と節（レクチャー）

| 用語 | 指すもの | 例 |
|---|---|---|
| **章** | `sections/<NN-section>/`。章立ては固定（イシュー #1） | `04-authentication/` |
| **節** | `sections/<NN-section>/<NN-lecture>/`。増減してよい | `04-authentication/01-auth-guard/` |

- 節のディレクトリは **その節を終えた時点のプロジェクト** を丸ごと持つ（`api/`）
- 次の節は、前の節のディレクトリをコピーして差分を足して作る（`tools/copy-lecture.sh <前の節> <次の節>`）
- 本文は `LECTURE.md`（`docs: true`）。節の直下の `README.md` は ZIP を展開した人向けの起動方法
- 説明図は `images/` に SVG で置く（`00-thumbnail.svg` を先頭サムネに。`tools/thumbnail.mjs` の THUMBNAILS に足して `node tools/thumbnail.mjs`）
- 章の直下には README を置かない
- 準備の節や Cognito のコンソール操作の節のように、プロジェクトを持たない節もある（本文だけ）

## プロジェクトの形

```text
sections/<sec>/<lec>/
├── README.md         起動方法（ZIP に入る。::tree には出さない）
├── LECTURE.md        教材本文（ZIP に入らない）
├── images/           説明図（ZIP に入らない）
└── api/              NestJS（nest new api --package-manager npm --skip-git から作った）
    ├── public/index.html   画面。main.ts の app.useStaticAssets() で配る
    └── src/
        ├── notes/          メモの API（dto/create-note.dto.ts・dto/update-note.dto.ts・entities/note.entity.ts）
        ├── auth/           03 章から（/auth/config、Guard、@CurrentUser()、@Public() など）
        └── admin/          06-02 から（/admin の middleware）
```

- 言語は **TypeScript**。NestJS 12（ESM。import の末尾は `.js`）
- パッケージマネージャはレクチャー側が **npm**（`api/package-lock.json`）、サイトが pnpm
- ポートは **3000**。画面（`public/index.html`）と API を同じ NestJS から配るので、CORS は要らない
- プロジェクトは **ビルドして動かすのに要るものだけ** にする（`src/`・`public/`・`package.json`・`package-lock.json`・
  `tsconfig.json`・`tsconfig.build.json`・`nest-cli.json`・`.gitignore`・`.env.example`）。`nest new` が作るテスト
  （`test/`・`*.spec.ts`・Vitest。テストは C の範囲）、lint・format（oxlint・Prettier）、`AGENTS.md`・`README.md`・
  `.gitattributes`、`AppController`・`AppService`（`GET /` が index.html とぶつかる）は消している。
  `package.json` のスクリプトは `build`・`start`・`start:dev` だけ
- 入力チェックは Zod ＋ NestJS 12 の `StandardSchemaValidationPipe`（`@Body({ schema })`）。`:id` は `ParseUUIDPipe`
- `.env` は gitignore。`api/.env.example` にプレースホルダだけを書いて追跡する。起動は Nest CLI の `--env-file .env`（`package.json` の `start`・`start:dev`）
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
