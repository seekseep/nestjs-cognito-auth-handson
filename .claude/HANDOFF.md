# 引き継ぎメモ（2026-11-20 作成）

## 状況

- 2026-11-20: 元のハンズオン（`seekseep/nest-js-and-cognito-handson`）を A・B・C の 3 本に分けることになり、
  B（認証と認可）としてこのリポジトリを作った。サイトの仕組み（`site/`・`tools/`・workflow）は元のリポジトリの main から持ってきた
- 土台は main に直接 push、教材は章ごとの PR でマージ済み（01 #2、02 #3、03 #4、04 #5、05 #6、06 #7）。GitHub Pages は Actions から出している（https://seekseep.github.io/nestjs-cognito-auth-handson/）
- 本物の Cognito での確認（サインイン・200・403・admin）はまだ。AWS の認証情報が無い環境で作ったため。イシュー #8 に残している

## 環境

- Node.js 26（nvm）。レクチャーの `api/` は npm、`site/` は pnpm（`site/package.json` の packageManager）
- NestJS 12.x（`@nestjs/cli` 12.0.13 の `nest new`）、aws-jwt-verify 5.x、zod 4.x

## 決まっている設計

- 章: 01 準備 / 02 はじめのプロジェクト / 03 Cognito でサインイン / 04 認証 / 05 認可 / 06 アプリ全体に掛ける
- プロジェクトは `api/`（NestJS）1 つ。画面は `api/public/index.html` を `app.useStaticAssets()` で配る。ポート 3000
- 02-01（はじめのプロジェクト）: `nest new` から `AppController`・`AppService`・`test/`（e2e）を消し、
  `notes/`（`dto/create-note.dto.ts`・`dto/update-note.dto.ts`・`entities/note.entity.ts`）を足した。
  DTO は Zod のスキーマと `z.infer` の型（`StandardSchemaValidationPipe` ＋ `@Body({ schema })`）。`:id` は `ParseUUIDPipe`
- 03-01 はコンソールでの操作だけ（プロジェクトを持たない節）。アプリケーションクライアントはシークレット無し・`ALLOW_USER_PASSWORD_AUTH`
- 03-02: ユーザープール ID とクライアント ID は `api/.env` に書き、`GET /auth/config` で画面に渡す（ID を 1 か所にまとめるため。
  `.env` は 04 章ではなく 03 章で入れた）。起動は `package.json` の `start`・`start:dev` に `--env-file .env`（Nest CLI のオプション）。
  画面は `fetch` で Cognito の `InitiateAuth`（`USER_PASSWORD_AUTH`）を呼び、コンソールで作ったユーザーの
  `NEW_PASSWORD_REQUIRED` には `RespondToAuthChallenge` で答える（`prompt()` で新しいパスワードを聞く）。
  アクセストークンは `sessionStorage`。サインアウトは手元から消すだけ（リフレッシュトークンは持たない）
- 04-01: `AuthGuard`（aws-jwt-verify の `CognitoJwtVerifier`、`tokenUse: 'access'`）を `NotesController` に `@UseGuards`
- 05-01: `ownerId`（`sub`）、`admin` グループ、`@CurrentUser()`、他の人のメモは 403
- 06-01: `APP_GUARD` と `@Public()`（`/auth/config` に付ける）。静的ファイル（index.html）は Guard より前に配られる
- 06-02: `TokenVerifier` に切り出し、`AdminMiddleware` を `forRoutes({ path: 'admin{/*splat}', method: RequestMethod.ALL })`。`GET /admin/notes`

## 確かめ方のメモ

- 各節の `api/` で `npm install` → `npm run build`・`npm run lint`・`npm test`
- 画面は Playwright（playwright-core ＋ 手元の Chrome）で、Cognito への要求を `page.route` で差し替えて確かめた
- 本物の Cognito が無い環境では、手元で作った RSA 鍵で Cognito と同じ形のアクセストークンに署名し、
  `TokenVerifier` の中の `verifier.cacheJwks()` に公開鍵を入れて、HTTP 越しに 401・403・200 を確かめた（06-02）
- ポート 3000 はほかの作業（A のハンズオン）が使っていることがあるので、確かめるときは `PORT` を変える

## 残っていること

- 本物の Cognito での手元確認（#8。サインイン、`NEW_PASSWORD_REQUIRED` の画面での答え方、200・403・admin・`/admin/notes`）
- A（`nestjs-rest-api-handson`）・C（`nestjs-testing-handson`）が公開されたら、README と 02-01 からリンクする
