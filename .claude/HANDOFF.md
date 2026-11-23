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

- 2026-11-23: プロジェクトを、ルートに `compose.yaml` と `apps/api/`・`apps/ui/` を並べるモノレポの形にした（C と同じ。B は E2E が無いので、ui は public に分けず、`apps/ui/` の直下を nginx が配る）。`.env` と `lambda.zip` はルート、`config.json` は `apps/ui/`
- 2026-11-23: 02-01 の「テストの仕組みを消す」（#30）を取り消し、`apps/api/` を `nest new` が作ったままの形に戻した（A #57 と同じ）。`nest g controller`・`service` は `--no-spec`
## 環境

- Node.js 26。レクチャーの `api/` は npm、`site/` は pnpm（`site/package.json` の packageManager）
- NestJS 12.x（`npx @nestjs/cli@12 new`）、aws-jwt-verify 5.x、Floci 2.4.0、Podman ＋ docker-compose、イメージは `node:26-slim`

## 決まっている設計

- 章と節（`.claude/AGENTS.md` とイシュー #1 も参照）。2026-11-21 に A の構成と書き方にそろえて作り直した
  - 01 準備: 01-environment / 02 Hello World: 01-nestjs・02-podman（api と web の nginx）/ 03 設計する: 01-notes-api・02-authentication・03-authorization（表と図だけ）
  - 04 実装する: 01-sqlite・02-create・03-list・04-delete（コントローラーに直接）/ 05 認証する: 01-sign-up・02-log-in・03-require-token・04-create-with-token
  - 06 認可する: 01-kinds・02-ownership・03-role・04-membership / 07 整理する: 01-database-provider・02-service・03-auth-middleware
  - 08 権限をどこで確かめるか: 01-overview・02-check-in-api・03-claims-in-token・04-compare
- compose のプロジェクト名は、どの節も `api`（フォルダ名）。Floci の設定はどの節も同じなので、節を移っても Floci は作り直されない
- `docker-compose` は既定で `Dockerfile` を探すので、`Containerfile` ではなく `Dockerfile`・`.dockerignore` にした

## 確かめ方のメモ

- 各節の `apps/api/` で `npm install` → `npm run build`（02-01 は手元で起動して `Hello World!`）
- 02-02 から: ルートで `podman compose up -d --build --wait`。画面は http://localhost:3000（nginx）、API は http://localhost:3001
- 04 章: curl で作成 201・一覧 200（と一覧の画面）・削除 204・無い id で 404
- 05 章から: `podman compose up -d --build --wait` → `node apps/api/scripts/setup-cognito.js` → `podman compose up -d --wait`。
  Playwright で signup.html（確認コードは `/_aws/ses` から）・login.html を操作して alice・bob のトークンを取り、
  トークン無し POST 401・alice POST 201・bob DELETE 403（06 章から）・トークン無し DELETE 401（06 章から）・alice DELETE 204・2 回目 404
- ポート 3000（画面）・3001（API）・4566（Floci）を使う。CORS は `http://localhost:3000` だけを許しているので、ずらして確かめるときは、compose のポート・`src/main.ts` の `origin`・Floci の `FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS`・`apps/ui/lib/api.js`・`apps/api/scripts/setup-cognito.js` の URL をそろえてずらす

## 残っていること

- Windows（PowerShell 7 ＋ Podman の WSL2 マシン）と Linux の Podman の手順は、公式の手順に沿って書いたもので、通しでは確かめていない
- A（`nestjs-rest-api-handson`）・C（`nestjs-testing-handson`）が公開されたら、README からリンクする
