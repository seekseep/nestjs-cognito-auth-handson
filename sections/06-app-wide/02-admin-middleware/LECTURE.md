---
docs: true
title: /admin を middleware で守る
---

# /admin を middleware で守る

![06 章 /admin を middleware で守る](./images/00-thumbnail.svg)

前の節の `@Public()` は、メソッドやコントローラーごとに決まりを付ける方法でした。この節では、**パス**（URL）で決まりを付けます。例として、管理用の API を `/admin` の下にまとめ、`/admin` の下はまるごと admin グループの人だけが使えるようにします。

パスで決まりを付けるには、**middleware** を使います。

## NestJS がリクエストを処理する順番

```text
リクエスト → Middleware → Guard → Pipe → コントローラー → 応答
                  （どこかで例外が起きると、エラーの応答になる）
```

| 段 | 何で決まるか | このハンズオンで使っているもの |
|---|---|---|
| Middleware | パス（`forRoutes`） | この節の `AdminMiddleware` |
| Guard | メソッド・コントローラー（`@UseGuards`・`APP_GUARD`） | `AuthGuard` |
| Pipe | 引数（`@Body({ schema })` など） | Zod の入力チェック・`ParseUUIDPipe` |

middleware は、Guard よりさらに先に動きます。middleware の時点では、まだ Guard がトークンを確かめていないので、`request.user` はありません。

## トークンの検証を切り出す

middleware でもトークンを確かめる必要があるので、Guard の中にあった検証を、`TokenVerifier` として切り出します。Guard と middleware の両方から使います。

::diff{file="api/src/auth/token-verifier.ts"}

Guard は `TokenVerifier` を使う形に書き換えます。

::diff{file="api/src/auth/auth.guard.ts"}

`if (request.user) return true;` は、「middleware がもう検証していれば、もう一度は確かめない」という意味です。`/admin` の下では middleware と Guard の両方が動くので、同じトークンを 2 回確かめずに済みます。

`AuthModule` で `TokenVerifier` を登録し、ほかのモジュールからも使えるように `exports` に入れます。

::diff{file="api/src/auth/auth.module.ts"}

## admin 専用の middleware を作る

::diff{file="api/src/admin/admin.middleware.ts"}

- `NestMiddleware` の `use(req, res, next)` が、リクエストごとに呼ばれます。`next()` を呼ぶと次の段（Guard）へ進みます
- トークンを確かめ、admin グループでなければ `ForbiddenException`（`403`）を投げます
- 確かめたユーザーを `req.user` に入れておくので、コントローラーで `@CurrentUser()` が使えます

## 管理用の API を作る

全員のメモを返す `GET /admin/notes` を作ります。

::diff{file="api/src/admin/admin.controller.ts"}

`NotesService` を `AdminModule` からも使うので、`NotesModule` で公開します。

::diff{file="api/src/notes/notes.module.ts"}

`AdminModule` で、middleware をパスに掛けます。

::diff{file="api/src/admin/admin.module.ts"}

- middleware は `@Module()` には書かず、`configure()` の中で `consumer.apply(...).forRoutes(...)` と書きます。そのため `NestModule` を実装します
- `'admin{/*splat}'` は「`/admin` と、その下のすべて」です。`*splat` は何文字でも合う部分で、`{}` で囲むと「無くてもよい」になります

`AppModule` で読み込みます。

::diff{file="api/src/app.module.ts"}

## 動かす

admin のユーザー（alice）のトークンなら、全員のメモが返ります。

```bash
curl http://localhost:3000/admin/notes -H "Authorization: Bearer $TOKEN"
```

admin でないユーザー（bob）のトークンだと `403` です。

```json
{"message":"Admin only","error":"Forbidden","statusCode":403}
```

トークン無しなら `401` です。存在しない `/admin` を呼んでも `404` ではなく `401` になります。middleware は、ルートがあるかを調べるより先に、パスだけを見て動くからです。

:::::platform
::::macos-linux
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/notes
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin
```
::::
::::windows
```powershell
curl -s -o NUL -w "%{http_code}\n" http://localhost:3000/admin/notes
curl -s -o NUL -w "%{http_code}\n" http://localhost:3000/admin
```
::::
:::::

```text
401
401
```

## Guard と middleware の使い分け

| | Guard | Middleware |
|---|---|---|
| 決める単位 | メソッド・コントローラー | パス |
| 呼ばれるメソッドの情報（`@Public()` など） | 読める | 読めない（まだ決まっていない） |
| 向いていること | 認証・認可の多く | パスでまとめた決まり、ログなど全部に掛けたいこと |

このハンズオンでは、ふだんの認証は Guard、`/admin` の下のように「パスでまとめて決めたい」ものは middleware、と使い分けています。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Middleware](https://docs.nestjs.com/middleware) … middleware の書き方と `forRoutes()`、`{/*splat}` の書き方
- [NestJS: Request lifecycle](https://docs.nestjs.com/faq/request-lifecycle) … middleware・Guard・Pipe が動く順番
- [NestJS: Modules](https://docs.nestjs.com/modules) … `exports` で、ほかのモジュールにプロバイダーを公開する

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### `forRoutes('admin')` と書いてもいい？

Express では `/admin/notes` のような下のパスにも掛かりますが、Fastify では `/admin` ちょうどにしか掛かりません。NestJS のドキュメントでは、どちらでも同じに動く `'admin{/*splat}'` を勧めています。

### middleware で `request.user` が読めない

middleware は Guard より先に動くので、Guard が入れる `request.user` はまだありません。middleware で誰かを知りたいときは、この節のように middleware の中でトークンを確かめます。

### 画面に「全員のメモ」を出したい

admin でサインインしているなら、`/notes` もすでに全員のメモを返します（05 章）。`/admin/notes` は、「admin しか呼べない API をパスでまとめる」例として作りました。

:::
