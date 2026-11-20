---
docs: true
title: HTML からサインインする
---

# HTML からサインインする

![03 章 HTML からサインインする](./images/00-thumbnail.svg)

前の節で作ったユーザーで、画面からサインインできるようにします。サインインできたら、Cognito から受け取った **アクセストークン** を、API を呼ぶときに付けて送ります。

```text
画面を配る   ブラウザ ◀── index.html・/auth/config ── NestJS（http://localhost:3000）
サインイン   ブラウザ ── InitiateAuth ──▶ Cognito（https://cognito-idp.ap-northeast-1.amazonaws.com）
API を呼ぶ   ブラウザ ── Authorization: Bearer <アクセストークン> ──▶ NestJS
```

ライブラリ（AWS SDK や Amplify）は使わず、`fetch` で Cognito の API を直接呼びます。中で何が起きているかが見えるようにするためです。

## ID を .env に書く

画面は「どのユーザープールに、どのアプリケーションクライアントとしてサインインするか」を知る必要があります。この 2 つの ID は、コードに直接書かずに、API の環境変数で渡します。04 章で API がトークンを確かめるときにも、同じ値を使います。

まず、どんな変数が要るかを書いた見本を作ります。

::diff{file="api/.env.example"}

`api/` で、見本をコピーして `.env` を作ります。

```bash
cp .env.example .env
```

`.env` の 2 つの値を、前の節で控えた ID に置き換えます（`=` の前後に空白は入れません）。

```ini
COGNITO_USER_POOL_ID=ap-northeast-1_AbCdEfGhI
COGNITO_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
```

:::danger
`.env` は Git に入れないでください。`api/.gitignore` で `.env` を無視し、見本の `.env.example` だけを例外にしています。`git status` に `.env` が出てこないことを確かめてから、コミットしてください。
:::

### 起動するときに .env を読む

Nest CLI の `--env-file` で、起動するときに `.env` を読ませます。読んだ値は `process.env.COGNITO_USER_POOL_ID` のように使えます。

::diff{file="api/package.json"}

## ID を画面に渡す

画面が ID を受け取るための API、`GET /auth/config` を作ります。認証にかかわるものは `auth/` にまとめていきます。

::diff{file="api/src/auth/auth.controller.ts"}

::diff{file="api/src/auth/auth.module.ts"}

::diff{file="api/src/app.module.ts"}

## 画面にサインインを足す

::diff{file="api/public/index.html"}

上から順に見ていきます。

- **サインインのフォーム** … メールアドレスとパスワードを入れる欄と、サインアウトのボタン、アクセストークンの中身を出す欄を足しました
- **`session`** … サインインできたら、メールアドレスとアクセストークンを `sessionStorage` に置きます。ページを読み込み直してもサインインしたままで、タブを閉じると消えます
- **`decodeJwt`** … アクセストークンの真ん中（ペイロード）を Base64URL から戻して、画面に出します。署名は確かめていません。表示するだけなので、ここでは要らないからです（確かめるのは API の仕事で、04 章で作ります）
- **`api()` の `authorization`** … サインインしていれば、`Authorization: Bearer <アクセストークン>` を付けて API を呼びます。API が「誰からの呼び出しか」を知るための情報です
- **`config` と `cognitoEndpoint`** … `/auth/config` で ID を受け取ります。Cognito の API の入口は、ユーザープール ID の `_` より前にあるリージョンから決まります
- **`cognito()`** … Cognito の API を 1 つ呼ぶ関数です。どの操作かを `x-amz-target` ヘッダーで伝えます。`InitiateAuth` などのサインインの API は、AWS の認証情報なしで、クライアント ID だけで呼べます
- **サインイン** … `InitiateAuth` を `USER_PASSWORD_AUTH` で呼びます。成功すると `AuthenticationResult` に ID トークン・アクセストークン・リフレッシュトークンが入っています。このハンズオンではアクセストークンだけを使います
- **`NEW_PASSWORD_REQUIRED`** … コンソールで作ったユーザーは、最初のサインインでトークンの代わりに「新しいパスワードを決めて」というチャレンジが返ります。`prompt()` で新しいパスワードを聞き、`RespondToAuthChallenge` で答えると、トークンが返ります
- **サインアウト** … 手元のアクセストークンを消します

## 動かす

`package.json` を変えたので、`Ctrl+C` で止めて起動し直します（`.env` は起動するときにだけ読みます）。

```bash
npm run start:dev
```

<http://localhost:3000> を開きます。

1. 前の節で作ったユーザーのメールアドレスと仮パスワードで **サインイン** を押す
2. 「新しいパスワードを決めてください」と聞かれるので、新しいパスワードを入れる（仮パスワードと同じ決まり）
3. 「`alice@example.com` でサインイン中」になる。「アクセストークンの中身」を開くと、`sub`・`client_id`・`token_use` などが出ている
4. 一度サインアウトして、新しいパスワードでサインインし直せることも確かめる

ブラウザの開発者ツールの **Network** タブで、次を確かめてください。

- サインインの要求は `cognito-idp.ap-northeast-1.amazonaws.com` に飛んでいて、ヘッダーに `x-amz-target: AWSCognitoIdentityProviderService.InitiateAuth` が付いている。**パスワードは NestJS を通りません**
- サインインしたあとの `notes` への要求に、`Authorization: Bearer eyJ...` が付いている

ただし、API はまだトークンを見ていません。サインアウトしても、curl から呼んでも、これまでどおりメモを読み書きできます。トークンを確かめるのは次の章です。

:::warning
**トークンの置き場所**

この画面はアクセストークンを `sessionStorage` に置いています。ページに XSS（他人の JavaScript を動かされてしまう不具合）があると、読まれてしまう場所です。本番では、トークンをサーバー側で持ち、ブラウザとは httpOnly の Cookie でやり取りする形なども考えてください。
:::

:::notice
**パスワードを画面で受け取るのは練習のため**

この画面は、パスワードを自分のフォームで受け取って、そのまま Cognito に送っています（HTTPS なので途中で読まれることはありません）。本番では、パスワードそのものを送らない SRP（Amplify の既定）や、サインインの画面ごと Cognito に任せる「マネージドログイン」をすすめます。ここでは、トークンの流れを目で追うために、あえて自分で呼んでいます。
:::

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Amazon Cognito API: InitiateAuth](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html) … `USER_PASSWORD_AUTH` でのサインインと、返ってくる `AuthenticationResult`
- [Amazon Cognito API: RespondToAuthChallenge](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html) … `NEW_PASSWORD_REQUIRED` への答え方（`NEW_PASSWORD` と `USERNAME`）
- [Amazon Cognito: Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) … ID トークン・アクセストークン・リフレッシュトークンの役割
- [NestJS: CLI command reference](https://docs.nestjs.com/cli/usages) … `nest start` の `--env-file`
- [MDN: Window.sessionStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage) … タブを閉じると消える保存場所

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

ZIP には `.env` は入っていません。展開したら `.env.example` をコピーして作ってください。

:::faq

### `InvalidParameterException: USER_PASSWORD_AUTH flow not enabled for this client` と出る

アプリケーションクライアントの認証フローに `ALLOW_USER_PASSWORD_AUTH` がありません。前の節の「パスワードでのサインインを許可する」をやり直してください。

### `NotAuthorizedException: Incorrect username or password.` と出る

メールアドレスかパスワードが違います。新しいパスワードを決めたあとは、仮パスワードではサインインできません。

### 「api/.env にユーザープール ID とクライアント ID を書いて…」と出る

`/auth/config` が ID を返していません。`api/.env` があるか、変数の名前が `.env.example` と同じかを確かめ、API を起動し直してください。<http://localhost:3000/auth/config> を開くと、API が読んだ値が見られます。

### `InvalidPasswordException` と出る

新しいパスワードが、パスワードの決まり（既定では 8 文字以上で、数字・記号・大文字・小文字を含む）に合っていません。

:::
