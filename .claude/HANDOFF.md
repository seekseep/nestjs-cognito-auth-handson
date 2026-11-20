# 引き継ぎメモ（2026-11-20 作成）

## 状況

- 2026-11-20: 元のハンズオン（`seekseep/nest-js-and-cognito-handson`）を A・B・C の 3 本に分けることになり、
  B（認証と認可）としてこのリポジトリを作った。サイトの仕組み（`site/`・`tools/`・workflow）は元のリポジトリの main から持ってきた
- 土台は main に直接 push、教材は章ごとの PR でマージ済み（01 #2、02 #3、03 #4、04 #5、05 #6、06 #7）。GitHub Pages は Actions から出している（https://seekseep.github.io/nestjs-cognito-auth-handson/）
- 2026-11-20: 本文を重要な要素だけに絞り、各節の `api/` をビルドして動かすのに要るファイルだけにした（#11。テスト・lint・format を消した）
- 2026-11-20: 本物の AWS をやめ、Cognito のエミュレーター Floci を Podman で手元に動かす構成にした。サインイン・200・401・403・
  admin・`/admin/notes` を、Floci 2.4.0 と Playwright（ブラウザからのサインイン）で手元で確かめた（#8 を閉じた）
- 2026-11-20: ユーザーの指示で作り直した。「コードが多くて複雑に見える」ため、ノートの作成（ログインした人）・一覧（誰でも）・
  削除（作った人）だけの API にし、章立てを 準備 / エンドポイントを作る / 認証する / 認可する / 整理する にした。
  API も Podman で動かす。メモの更新・単一取得・admin グループ・Guard・`@Public()` などは消した

## 環境

- Node.js 26。レクチャーの `api/` は npm、`site/` は pnpm（`site/package.json` の packageManager）
- NestJS 12.x（`npx @nestjs/cli@12 new`）、aws-jwt-verify 5.x、Floci 2.4.0、Podman ＋ docker-compose、イメージは `node:26-slim`

## 決まっている設計

- 章と節（`.claude/AGENTS.md` とイシュー #1 も参照）
  - 01 準備: 01-tools（Node.js・Podman）
  - 02 エンドポイントを作る: 01-hello-world（手元の Node.js）/ 02-podman（Dockerfile・compose）/ 03-create-note / 04-list-notes / 05-delete-note
  - 03 認証する: 01-sign-up（Floci・setup-cognito.mjs・`GET /config`・cognito.js・signup.html）/ 02-log-in（login.html）/
    03-require-token（verify-token.ts、`POST /notes` だけ 401）/ 04-create-with-token（本文だけ。curl でトークンを付ける）
  - 04 認可する: 01-owner-only（`ownerId` ＝ `sub`、削除で 403）/ 02-delete-fails（本文だけ。bob で 403）/ 03-delete-succeeds（本文だけ。alice で 204）
  - 05 整理する: 01-auth-middleware（`AuthMiddleware` を `forRoutes({ path: 'notes', method: POST }, { path: 'notes/:id', method: DELETE })`、`@Req()` で `req.user.sub`）
- compose のプロジェクト名は、どの節も `api`（フォルダ名）。Floci の設定はどの節も同じなので、節を移っても Floci は作り直されない
- `docker-compose` は既定で `Dockerfile` を探すので、`Containerfile` ではなく `Dockerfile`・`.dockerignore` にした

## 確かめ方のメモ

- 各節の `api/` で `npm install` → `npm run build`（02-01 は手元で起動して `Hello World!`）
- 02 章: `podman compose up -d --build --wait` のあと curl で作成 201・一覧・削除 204・無い id で 404
- 03 章から: `podman compose up -d --build --wait` → `node scripts/setup-cognito.mjs` → `podman compose up -d --wait`。
  Playwright で signup.html（確認コードは `/_aws/ses` から）・login.html を操作して alice・bob のトークンを取り、
  トークン無し POST 401・でたらめ 401・alice POST 201・トークン無し GET 200・bob DELETE 403・トークン無し DELETE 401・alice DELETE 204
- ポート 3000 と 4566 を使う。CORS は `http://localhost:3000` だけを許しているので、確かめるときもポート 3000 で動かす

## 残っていること

- Windows（PowerShell 7 ＋ Podman の WSL2 マシン）と Linux の Podman の手順は、公式の手順に沿って書いたもので、通しでは確かめていない
- A（`nestjs-rest-api-handson`）・C（`nestjs-testing-handson`）が公開されたら、README からリンクする
