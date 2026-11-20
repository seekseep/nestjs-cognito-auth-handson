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

ライブラリは使わず、`fetch` で Cognito の API を直接呼びます。中で何が起きているかが見えるようにするためです。

## ID を .env に書く

前の節で控えた 2 つの ID は、コードに直接書かずに、API の環境変数で渡します。04 章で API がトークンを確かめるときにも、同じ値を使います。

::diff{file="api/.env.example"}

`api/` で、見本をコピーして `.env` を作ります。

```bash
cp .env.example .env
```

`.env` の 2 つの値を、前の節で控えた ID に置き換えます。

```ini
COGNITO_USER_POOL_ID=ap-northeast-1_AbCdEfGhI
COGNITO_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
```

:::danger
`.env` は Git に入れないでください。`api/.gitignore` で `.env` を無視しています。コミットする前に、`git status` に `.env` が出てこないことを確かめてください。
:::

### 起動するときに .env を読む

Nest CLI の `--env-file` で、起動するときに `.env` を読ませます。読んだ値は `process.env.COGNITO_USER_POOL_ID` のように使えます。

::diff{file="api/package.json"}

## ID を画面に渡す

画面が ID を受け取るための API、`GET /auth/config` を作ります。認証にかかわるものは `auth/` にまとめます。

::diff{file="api/src/auth/auth.controller.ts"}

::diff{file="api/src/auth/auth.module.ts"}

::diff{file="api/src/app.module.ts"}

## 画面にサインインを足す

::diff{file="api/public/index.html"}

- **`session`** … サインインできたら、メールアドレスとアクセストークンを `sessionStorage` に置きます。タブを閉じると消えます
- **`decodeJwt`** … アクセストークンの真ん中（ペイロード）を Base64URL から戻して、画面に出します。署名は確かめていません（確かめるのは API の仕事で、04 章で作ります）
- **`api()`** … サインインしていれば、`Authorization: Bearer <アクセストークン>` を付けて API を呼びます
- **`cognito()`** … Cognito の API を 1 つ呼ぶ関数です。どの操作かを `x-amz-target` ヘッダーで伝えます。サインインの API は、AWS の認証情報なしで、クライアント ID だけで呼べます
- **サインイン** … `InitiateAuth` を `USER_PASSWORD_AUTH` で呼びます。成功すると ID トークン・アクセストークン・リフレッシュトークンが返ります。このハンズオンではアクセストークンだけを使います
- **`NEW_PASSWORD_REQUIRED`** … コンソールで作ったユーザーは、最初のサインインで「新しいパスワードを決めて」というチャレンジが返ります。`RespondToAuthChallenge` で新しいパスワードを答えると、トークンが返ります

## 動かす

`package.json` を変えたので、`Ctrl+C` で止めて起動し直します（`.env` は起動するときにだけ読みます）。

```bash
npm run start:dev
```

<http://localhost:3000> を開きます。

1. 前の節で作ったユーザーのメールアドレスと仮パスワードで **サインイン** を押す
2. 「新しいパスワードを決めてください」と聞かれるので、新しいパスワードを入れる（仮パスワードと同じ決まり）
3. 「`alice@example.com` でサインイン中」になる。「アクセストークンの中身」を開くと、`sub`・`client_id`・`token_use` などが出ている

ブラウザの開発者ツールの **Network** タブで、次を確かめてください。

- サインインの要求は `cognito-idp.ap-northeast-1.amazonaws.com` に飛んでいて、ヘッダーに `x-amz-target: AWSCognitoIdentityProviderService.InitiateAuth` が付いている。**パスワードは NestJS を通りません**
- サインインしたあとの `notes` への要求に、`Authorization: Bearer eyJ...` が付いている

ただし、API はまだトークンを見ていません。サインアウトしても、curl から呼んでも、これまでどおりメモを読み書きできます。トークンを確かめるのは次の章です。

:::warning
**本番ではこの形にしない**

この画面は、パスワードを自分のフォームで受け取って Cognito に送り、アクセストークンを `sessionStorage` に置いています。トークンの流れを目で追うための練習の形です。`sessionStorage` は、ページに XSS があると読まれてしまう場所です。本番では、サインインの画面ごと Cognito に任せる「マネージドログイン」や、トークンをサーバー側で持つ形を考えてください。
:::

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Amazon Cognito API: InitiateAuth](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html) … `USER_PASSWORD_AUTH` でのサインインと、返ってくる `AuthenticationResult`
- [Amazon Cognito API: RespondToAuthChallenge](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html) … `NEW_PASSWORD_REQUIRED` への答え方（`NEW_PASSWORD` と `USERNAME`）
- [Amazon Cognito: Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) … ID トークン・アクセストークン・リフレッシュトークンの役割
- [NestJS: CLI command reference](https://docs.nestjs.com/cli/usages) … `nest start` の `--env-file`

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

:::
