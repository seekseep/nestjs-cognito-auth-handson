---
docs: true
title: ユーザープールを作る
---

# ユーザープールを作る

![03 章 ユーザープールを作る](./images/00-thumbnail.svg)

いまのメモ API は、誰でも読み書きできます。ここから、**サインインした人だけが使える** ようにしていきます。サインインの仕組みには **Amazon Cognito** を使います。

このハンズオンでは、本物の Cognito の代わりに、手元で動くエミュレーター **[Floci](https://floci.io/)** を Podman で動かします。Cognito と同じ API で呼べ、同じ形のトークンを発行します。この節では Floci を起動し、ユーザープールとアプリケーションクライアントを作り、サインインに使うユーザーを登録します。

## Cognito の役割

```text
画面 ──メールアドレスとパスワード──▶ Cognito（ユーザープール）
     ◀──────── トークン ─────────┘
画面 ──トークンを付けて呼ぶ──▶ API（トークンを確かめてから応答する）
```

| 用語 | 意味 |
|---|---|
| **ユーザープール** | ユーザー（メールアドレスとパスワード）を入れておく場所。サインインを引き受ける |
| **アプリケーションクライアント** | ユーザープールを使うアプリの登録。画面はこの ID を使ってユーザープールにサインインを頼む |
| **トークン** | サインインに成功すると受け取る、署名付きの「通行証」（JWT）。API はこれを見て、誰からの呼び出しかを確かめる |

## Floci を起動する

::diff{file="api/compose.yaml"}

- ポートは **4566** です。Floci は認証なしで API を受け付けるので、`127.0.0.1:` を付けて自分のパソコンからだけ届くようにしています
- `FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS` … 次の節で、画面（`http://localhost:3000`）から Floci を直接呼ぶので、その呼び出しを許します

起動と停止のコマンドを `package.json` に足します。あわせて、次に作るスクリプトを動かすコマンドも足します。

::diff{file="api/package.json"}

`api/` で Floci を起動します。

```bash
npm run floci:up
```

```text
 Container api-floci-1  Healthy
```

`Healthy` と出れば準備できています。

## ユーザープールとユーザーを作る

Cognito の API を呼んで、ユーザープール・アプリケーションクライアント・ユーザーを作るスクリプトです。

::diff{file="api/scripts/setup-cognito.mjs"}

- `cognito()` … Cognito の API を 1 つ呼びます。どの操作かを `x-amz-target` ヘッダーで伝えます
- `CreateUserPoolClient` … `GenerateSecret: false` で、クライアントシークレットの無いクライアントにします。ブラウザで動くコードは誰でも中身を見られるので、秘密の値は持たせられないからです。`ALLOW_USER_PASSWORD_AUTH` で、メールアドレスとパスワードでのサインインを許します
- `AdminSetUserPassword` … `Permanent: true` で、そのままサインインに使えるパスワードにします
- 最後に、Cognito の入口・ユーザープール ID・クライアント ID を `api/.env` に書きます。次の節から API が読みます

```bash
npm run cognito:setup
```

```text
ユーザープール us-east-1_578d9b58c・クライアント 53c2fa7fe336463bbd611840a8 を作り、.env に書きました
ユーザー: alice@example.com（admin）・bob@example.com、パスワードはどちらも Passw0rd!
```

:::warning
Floci はデータをメモリに持つので、Floci を止めたり、パソコンを再起動したりすると、ユーザープールもユーザーも消えます。そのときは `npm run floci:up` と `npm run cognito:setup` をやり直し、API を起動し直してください（ID が変わるので、`.env` を読み直す必要があります）。
:::

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Floci: Cognito](https://floci.io/floci/services/cognito/) … Floci の Cognito で使える機能と、CORS の設定（`FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS`）
- [Amazon Cognito: User pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html) … ユーザープールの役割
- [Amazon Cognito: Application-specific settings with app clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) … アプリケーションクライアントと、クライアントシークレットを使わない設定
- [Amazon Cognito API: AdminSetUserPassword](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminSetUserPassword.html) … `Permanent` で仮でないパスワードにする

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### `npm run floci:up` が `exit status 1` で終わる

ほかのプログラムがポート 4566 を使っていると起動できません。`podman compose logs floci` でログを見てください。macOS・Windows では、`podman machine start` をしていないときにも失敗します。

:::
