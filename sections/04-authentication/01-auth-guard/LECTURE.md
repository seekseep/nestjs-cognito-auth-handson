---
docs: true
title: 認証 — トークンを検証する
---

# 認証 — トークンを検証する

![04 章 認証 — トークンを検証する](./images/00-thumbnail.svg)

前の章で、画面はアクセストークンを付けて API を呼ぶようになりました。しかし API はまだトークンを見ていないので、curl から誰でも呼べます。この節では、API が **アクセストークンを検証して、サインインした人の呼び出しだけを受け付ける** ようにします。

このハンズオンでは 2 つの言葉を使い分けます。

| 言葉 | 確かめること | 章 |
|---|---|---|
| **認証**（Authentication） | 誰からの呼び出しか | この章 |
| **認可**（Authorization） | その人に、その操作をさせてよいか | 05 章 |

## アクセストークンとは

アクセストークンは **JWT**（JSON Web Token）という形の文字列です。`.` で区切られた 3 つの部分でできています。

```text
eyJraWQiOi...（ヘッダー）.eyJzdWIiOi...（ペイロード）.Wd3h1c...（署名）
```

前の節で画面に出した「アクセストークンの中身」が、ペイロードです。

```json
{
  "sub": "7a1b2c3d-...",
  "iss": "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_AbCdEfGhI",
  "client_id": "1a2b3c4d5e6f7g8h9i0j1k2l3m",
  "token_use": "access",
  "exp": 1795000000,
  "username": "7a1b2c3d-..."
}
```

| 項目 | 意味 |
|---|---|
| `sub` | ユーザーごとに決まる ID。05 章で「メモの持ち主」に使う |
| `iss` | 発行元（どのユーザープールが発行したか） |
| `client_id` | どのアプリケーションクライアントのために発行したか |
| `token_use` | `access`（アクセストークン）か `id`（ID トークン）か |
| `exp` | 期限（1970 年からの秒数）。既定では発行から 1 時間 |

中身は誰でも読めます。大事なのは **署名** です。署名は Cognito だけが持つ秘密鍵で作られていて、Cognito が公開している公開鍵（**JWKS**）で確かめられます。中身を 1 文字でも書き換えると、署名が合わなくなります。

## aws-jwt-verify を入れる

署名と中身の確認には、AWS が公開している **aws-jwt-verify** を使います。公開鍵の取得とキャッシュまで引き受けてくれます。

```bash
npm install aws-jwt-verify
```

::diff{file="api/package.json"}

## Guard を作る

NestJS で「このリクエストを通すかどうか」を決める部品を **Guard** と呼びます。Guard の `canActivate()` が `true` を返せば、コントローラーのメソッドが呼ばれます。例外を投げれば、そのままエラーの応答になります。

::diff{file="api/src/auth/auth.guard.ts"}

- `CognitoJwtVerifier.create(...)` … ユーザープール ID・`tokenUse: 'access'`・クライアント ID を渡すと、それに合うトークンだけを正しいとする検証器ができます。ID トークンや、別のアプリケーションクライアントのトークンは通りません
- `requireEnv` … 環境変数が無ければ、起動するときにエラーで止めます。気づかずに動き続けるより、すぐ分かるほうが直しやすいからです
- `request.headers.authorization?.split(' ')` … `Bearer <トークン>` を、`Bearer` とトークンに分けます
- `this.verifier.verify(token)` … 署名・発行元・期限・`token_use`・`client_id` を確かめ、正しければペイロードを返します。正しくなければ例外を投げるので、`UnauthorizedException`（`401`）にします
- `request.user = ...` … 確かめたペイロードをリクエストに入れておきます。05 章で「誰からの呼び出しか」を知るのに使います

## Guard を掛ける

`@UseGuards(AuthGuard)` で Guard を掛けます。コントローラーに付けるとすべてのメソッドに、メソッドに付けるとそのメソッドだけに掛かります。メモの API は、すべてサインインが必要なので、コントローラーに付けます。

::diff{file="api/src/notes/notes.controller.ts"}

`/auth/config` には掛けていないので、これまでどおりトークン無しで呼べます（サインインする前に呼ぶので、そうでないと困ります）。

### テストでは Guard を差し替える

コントローラーのテストは、コントローラーを作るときに Guard も作ります。テストには Cognito の ID が無いので、`requireEnv` がエラーにします。テストでは `overrideGuard` で、Guard を「いつも通す」ものに差し替えます。

::diff{file="api/src/notes/notes.controller.spec.ts"}

```bash
npm test
```

## 動かす

`start:dev` が動いていれば、保存したときに起動し直されています。止めていたら `npm run start:dev` で起動します。

### トークン無しでは呼べない

```bash
curl -i http://localhost:3000/notes
```

```text
HTTP/1.1 401 Unauthorized
...
{"message":"Missing bearer token","error":"Unauthorized","statusCode":401}
```

でたらめなトークンを付けても通りません。

```bash
curl http://localhost:3000/notes -H "Authorization: Bearer abc.def.ghi"
```

```json
{"message":"Invalid token","error":"Unauthorized","statusCode":401}
```

### 画面からは呼べる

<http://localhost:3000> でサインインすると、これまでどおりメモを読み書きできます。画面はアクセストークンを付けて呼んでいるからです。サインアウトすると、画面の上に `401 Missing bearer token` と出ます。

### 自分のトークンで curl から呼ぶ

ブラウザの開発者ツールの **Network** タブで `notes` への要求を選び、リクエストヘッダーの `Authorization` の値（`Bearer` の後ろ）をコピーします。これを付ければ、curl からも呼べます。

:::::platform
::::macos-linux
```bash
TOKEN="eyJraWQiOi...（コピーした値）"
curl http://localhost:3000/notes -H "Authorization: Bearer $TOKEN"
```
::::
::::windows
```powershell
$TOKEN = "eyJraWQiOi...（コピーした値）"
curl http://localhost:3000/notes -H "Authorization: Bearer $TOKEN"
```
::::
:::::

アクセストークンの期限は 1 時間です。期限が切れると `Invalid token` になるので、画面でサインインし直してください。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Guards](https://docs.nestjs.com/guards) … Guard の役割と `@UseGuards()`
- [NestJS: Testing](https://docs.nestjs.com/fundamentals/testing) … テストで Guard を差し替える `overrideGuard()`
- [Amazon Cognito: Verifying JSON web tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html) … アクセストークンの検証で確かめること
- [Amazon Cognito: Understanding the access token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html) … アクセストークンに入っている項目（`sub`・`client_id`・`token_use` など）
- [aws-jwt-verify（README）](https://github.com/awslabs/aws-jwt-verify) … `CognitoJwtVerifier` の使い方

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### API が `環境変数 COGNITO_USER_POOL_ID がありません` で止まる

`api/.env` が無いか、変数の名前が違います。03-02 の「ID を .env に書く」を確かめてから、起動し直してください。

### 画面で `Invalid token` と出る

アクセストークンの期限（1 時間）が切れていることが多いです。画面でサインアウトして、サインインし直してください。`api/.env` を書き換えたときも、API を起動し直してからサインインし直します。

### ID トークンを送ってはいけないの？

ID トークンは「画面が、サインインした人の情報を知るため」のものです。API の呼び出しには、API に渡すためのアクセストークンを使うのが決まりです。この Guard は `tokenUse: 'access'` にしているので、ID トークンを送ると `Invalid token` になります。

### サインアウトしたら、そのトークンは使えなくなる？

この画面のサインアウトは、手元のトークンを消すだけです。トークンそのものは、期限（1 時間）までは署名も中身も正しいままなので、API は受け付けます。すぐに使えなくしたいときは、Cognito の「トークンの取り消し」やグローバルサインアウトと、API 側での確認を組み合わせます（このハンズオンでは扱いません）。

### `@nestjs/authentication` は使わないの？

NestJS には、認証のための公式パッケージ `@nestjs/authentication` もあります。このハンズオンでは、Guard の中で何が起きているかが見えるように、Guard を自分で書きました。詳しくは [NestJS の Authentication の章](https://docs.nestjs.com/security/authentication) を見てください。

:::
