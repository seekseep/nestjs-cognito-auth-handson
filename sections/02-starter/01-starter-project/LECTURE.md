---
docs: true
title: はじめのプロジェクト
---

# はじめのプロジェクト

![02 章 はじめのプロジェクト](./images/00-thumbnail.svg)

このハンズオンは、**メモの REST API** ができあがった状態から始めます。まず、そのプロジェクトをダウンロードして動かし、どのファイルが何をしているかをざっと見ておきます。

:::download
[はじめのプロジェクトをダウンロード](./project.zip)
:::

このプロジェクトでできることは、次の 2 つです。

- **REST API** … メモの一覧・取得・作成・更新・削除。メモはメモリ上に持つので、API を止めると消えます
- **画面** … メモの一覧・追加・削除ができる HTML 1 枚。API と同じ NestJS が配ります

いまは、誰でもすべてのメモを読み書きできます。ここに、サインイン（03 章）・認証（04 章）・認可（05 章）を足していきます。

:::notice
NestJS で REST API を作るところ（コントローラー・サービス・入力チェック）を順に学びたいときは、同じ作者の「NestJS で基本的な REST API」のハンズオンを見てください。このプロジェクトは、そのハンズオンで作るものとほぼ同じ形です。
:::

## 動かす

ZIP を好きな場所に展開し、中の `api/` に移って、ライブラリを入れてから起動します。

```bash
cd api
npm install
npm run start:dev
```

```text
[Nest] 12345  - ... LOG [NestApplication] Nest application successfully started
```

`start:dev` は、ファイルを保存するたびに起動し直すモードです。止めるときは `Ctrl+C` を押します。

ブラウザで <http://localhost:3000> を開き、メモを追加したり削除したりしてみてください。

curl でも呼べます。API を動かしたまま、ターミナルをもう 1 つ開いて実行します。

```bash
curl -X POST http://localhost:3000/notes -H "content-type: application/json" -d '{"title":"shopping","body":"milk"}'
curl http://localhost:3000/notes
```

```json
[{"id":"0b6e…","title":"shopping","body":"milk","createdAt":"2026-…","updatedAt":"2026-…"}]
```

## API の一覧

| メソッドとパス | すること | 成功したとき |
|---|---|---|
| `GET /notes` | メモの一覧 | `200` |
| `GET /notes/:id` | メモを 1 件 | `200`（無ければ `404`） |
| `POST /notes` | メモを作る（`title` は必須、`body` は省略できる） | `201` |
| `PATCH /notes/:id` | メモを書き換える（送った項目だけ） | `200` |
| `DELETE /notes/:id` | メモを消す | `204` |

入力が決まりに合わないときは `400` になります。

```bash
curl -X POST http://localhost:3000/notes -H "content-type: application/json" -d '{"title":""}'
```

```json
{"message":["title: Too small: expected string to have >=1 characters"],"error":"Bad Request","statusCode":400}
```

## ファイルの役割

`nest new api` で作ったプロジェクトに、メモの API と画面を足したものです。この節の最後のエディタで、どのファイルも中身を見られます。

| ファイル | 役割 |
|---|---|
| `src/main.ts` | 起動するところ。`public/` の中のファイルを配る設定（`useStaticAssets`）と、入力チェックの設定（`StandardSchemaValidationPipe`）をして、ポート 3000 で待ち受ける |
| `src/app.module.ts` | アプリ全体のモジュール。`NotesModule` を読み込む |
| `src/notes/notes.module.ts` | メモの機能をまとめるモジュール |
| `src/notes/notes.controller.ts` | URL とメソッド（`@Get()`・`@Post()` など）を、サービスの処理に結び付ける |
| `src/notes/notes.service.ts` | メモを配列に持ち、探す・足す・書き換える・消す |
| `src/notes/entities/note.entity.ts` | メモ 1 件の形（`id`・`title`・`body`・日時） |
| `src/notes/dto/create-note.dto.ts` | 作るときに受け取る値の決まり（Zod のスキーマ）と、その型 |
| `src/notes/dto/update-note.dto.ts` | 書き換えるときに受け取る値の決まり |
| `src/notes/*.spec.ts` | テスト（`npm test` で動く） |
| `public/index.html` | 画面。`fetch` で `/notes` を呼ぶ |

いくつかのところを、もう少しだけ見ておきます。

- **入力チェック** … コントローラーの `@Body({ schema: createNoteSchema })` が、受け取った JSON を Zod のスキーマで確かめます。`main.ts` の `StandardSchemaValidationPipe` がこれを動かし、合わなければ `400` を返します
- **`:id` のチェック** … `@Param('id', ParseUUIDPipe)` で、`:id` が UUID の形でなければ `400` にします
- **画面の配り方** … `app.useStaticAssets(...)` で `public/` を配っているので、<http://localhost:3000> を開くと `public/index.html` が返ります。画面と API が同じ場所（`http://localhost:3000`）にあるので、画面からは `fetch('/notes')` のようにパスだけで呼べます
- **`nest new` から消したもの** … `nest new` が作る `AppController`（`GET /` で `Hello World!` を返す）は、`GET /` が画面とぶつかるので消しました。HTTP で丸ごと確かめるテスト（`test/`）も、このハンズオンでは使わないので消しています

`package.json` のスクリプトのうち、このハンズオンで使うのは次のものです。

| コマンド | すること |
|---|---|
| `npm run start:dev` | 保存するたびに起動し直すモードで動かす |
| `npm run build` | `dist/` に JavaScript を書き出す（型の間違いがあればここで分かる） |
| `npm test` | テストを動かす |
| `npm run lint` | oxlint でコードを確かめる |

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: First steps](https://docs.nestjs.com/first-steps) … `nest new` が作るファイルと `npm run start:dev`
- [NestJS: Controllers](https://docs.nestjs.com/controllers) … `@Controller()`・`@Get()`・`@Post()`・`@HttpCode()`
- [NestJS: Validation](https://docs.nestjs.com/application/validation) … Zod のスキーマと `StandardSchemaValidationPipe`・`@Body({ schema })`
- [NestJS: Pipes](https://docs.nestjs.com/pipes) … `ParseUUIDPipe`
- [NestJS: Model-View-Controller](https://docs.nestjs.com/http/mvc) … `useStaticAssets()` で `public/` を配る

## この節を終えたときのディレクトリ

::tree

:::download
[はじめのプロジェクトをダウンロード](./project.zip)
:::

:::faq

### `npm run start:dev` で `EADDRINUSE` と出る

ほかのプログラムがポート 3000 を使っています。そのプログラムを止めるか、`PORT` を変えて起動してください。`main.ts` は `process.env.PORT` があればそれを使います。

### 画面に何も出ない・古いままになる

API が動いているか、ターミナルを確かめてください。`public/index.html` を書き換えたあとは、ブラウザで読み込み直します。

### メモが消えた

メモはメモリ上に持っているので、API を起動し直すと消えます。`start:dev` は保存のたびに起動し直すので、そのたびに消えます。このハンズオンでは、データベースは使いません。

:::
