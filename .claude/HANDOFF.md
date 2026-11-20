# 引き継ぎメモ（2026-11-20 作成）

## 状況

- 2026-11-20: 元のハンズオン（`seekseep/nest-js-and-cognito-handson`）を A・B・C の 3 本に分けることになり、
  B（認証と認可）としてこのリポジトリを作った。サイトの仕組み（`site/`・`tools/`・workflow）は元のリポジトリの main から持ってきた
- 土台は main に直接 push、教材は章ごとの PR でマージ済み（01 #2、02 #3、03 #4、04 #5、05 #6、06 #7）。GitHub Pages は Actions から出している（https://seekseep.github.io/nestjs-cognito-auth-handson/）
- 2026-11-20: 本文を重要な要素だけに絞り、各節の `api/` をビルドして動かすのに要るファイルだけにした（#11。テスト・lint・format を消した）
- 2026-11-20: 本物の AWS をやめ、Cognito のエミュレーター Floci を Podman で手元に動かす構成にした。サインイン・200・401・403・
  admin・`/admin/notes` を、Floci 2.4.0 と Playwright（ブラウザからのサインイン）で手元で確かめた（#8 を閉じた）

## 環境

- Node.js 26（nvm）。レクチャーの `api/` は npm、`site/` は pnpm（`site/package.json` の packageManager）
- NestJS 12.x（`@nestjs/cli` 12.0.13 の `nest new`）、aws-jwt-verify 5.x、zod 4.x

## 決まっている設計

- 章: 01 準備 / 02 はじめのプロジェクト / 03 Cognito でサインイン / 04 認証 / 05 認可 / 06 アプリ全体に掛ける
- プロジェクトは `api/`（NestJS）1 つ。画面は `api/public/index.html` を `app.useStaticAssets()` で配る。ポート 3000
- 02-01（はじめのプロジェクト）: `nest new` から `AppController`・`AppService`・`test/`（e2e）を消し、
  `notes/`（`dto/create-note.dto.ts`・`dto/update-note.dto.ts`・`entities/note.entity.ts`）を足した。
  DTO は Zod のスキーマと `z.infer` の型（`StandardSchemaValidationPipe` ＋ `@Body({ schema })`）。`:id` は `ParseUUIDPipe`
- 01-01: Node.js（公式インストーラー）・VS Code・Podman（macOS は Homebrew、Windows は winget の RedHat.Podman と
  Docker.DockerCompose、Linux は apt の podman と docker-compose-v2）。`podman compose` のプロバイダは docker-compose
- 03-01: `api/compose.yaml`（Floci 2.4.0、`127.0.0.1:4566`、`FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS=http://localhost:3000`）と
  `api/scripts/setup-cognito.mjs`（Node の `fetch` で Cognito の API を呼ぶ。aws CLI は使わない）。アプリケーションクライアントは
  シークレット無し・`ALLOW_USER_PASSWORD_AUTH`。ユーザーは `AdminSetUserPassword` の `Permanent` で、`NEW_PASSWORD_REQUIRED` は出ない。
  Floci はデータをメモリに持つので、起動し直したら `cognito:setup` もやり直す（ID が変わる）
- 03-02: `api/.env` を `--env-file .env` で読み、`GET /auth/config` で Cognito の入口（`endpoint`）とクライアント ID を画面に渡す。
  画面は `fetch` で `InitiateAuth`（`USER_PASSWORD_AUTH`）を呼ぶ。アクセストークンは `sessionStorage`
- 04-01: `AuthGuard`（aws-jwt-verify の `JwtVerifier`。issuer は `${COGNITO_ENDPOINT}/${プール ID}`、`token_use`・`client_id` は
  `customJwtCheck`、JWKS は `fetch` の fetcher で取る）を `NotesController` に `@UseGuards`。本物の Cognito では
  `COGNITO_ENDPOINT=https://cognito-idp.<リージョン>.amazonaws.com` にすれば同じコードで動く（06-02 の最後に書いた）
- 05-01: `ownerId`（`sub`）、`admin` グループ、`@CurrentUser()`、他の人のメモは 403
- 06-01: `APP_GUARD` と `@Public()`（`/auth/config` に付ける）。静的ファイル（index.html）は Guard より前に配られる
- 06-02: `TokenVerifier` に切り出し、`AdminMiddleware` を `forRoutes({ path: 'admin{/*splat}', method: RequestMethod.ALL })`。`GET /admin/notes`

## 確かめ方のメモ

- 各節の `api/` で `npm install` → `npm run build`
- `npm run floci:up` → `npm run cognito:setup` → API を起動し、`InitiateAuth` で alice・bob のトークンを取って、
  401・200・403・`/admin/notes` を HTTP で確かめる。画面は Playwright でサインインして確かめる
- ポート 3000 はほかの作業（A のハンズオン）が使っていることがあるので、確かめるときは `PORT` を変える
  （ただし画面から Floci を呼ぶ CORS は `http://localhost:3000` だけを許している）

## 残っていること

- Windows（PowerShell 7 ＋ Podman の WSL2 マシン）と Linux の Podman の手順は、公式の手順に沿って書いたもので、通しでは確かめていない
- A（`nestjs-rest-api-handson`）・C（`nestjs-testing-handson`）が公開されたら、README と 02-01 からリンクする
