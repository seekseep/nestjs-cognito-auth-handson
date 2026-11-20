---
docs: true
title: ユーザープールを作る
---

# ユーザープールを作る

![03 章 ユーザープールを作る](./images/00-thumbnail.svg)

いまのメモ API は、誰でも読み書きできます。ここから、**サインインした人だけが使える** ようにしていきます。サインインの仕組みには **Amazon Cognito** を使います。

この節では、AWS のコンソールで Cognito のユーザープールとアプリケーションクライアントを作り、サインインに使うユーザーを 1 人登録します。コードは書きません。

## Cognito の役割

```text
画面 ──メールアドレスとパスワード──▶ Cognito（ユーザープール）
     ◀──────── トークン ─────────┘
画面 ──トークンを付けて呼ぶ──▶ API（トークンを確かめてから応答する）
```

| 用語 | 意味 |
|---|---|
| **ユーザープール** | ユーザー（メールアドレスとパスワード）を入れておく場所。サインインやパスワードの変更を引き受ける |
| **アプリケーションクライアント** | ユーザープールを使うアプリの登録。画面はこの ID を使ってユーザープールにサインインを頼む |
| **トークン** | サインインに成功すると受け取る、署名付きの「通行証」（JWT）。API はこれを見て、誰からの呼び出しかを確かめる |

パスワードを確かめる処理や、パスワードを安全に保存する処理を自分で書かずに済むのが、Cognito を使う理由です。

## ユーザープールを作る

:::notice
コンソールの画面は変わることがあります。項目の名前が少し違っていたら、近いものを選んでください。
:::

1. AWS のコンソールにサインインし、右上のリージョンを **アジアパシフィック（東京）ap-northeast-1** にする
2. 上の検索欄で **Cognito** を開き、**ユーザープールを作成** を押す
3. 「アプリケーションを定義」で次のように選ぶ

| 項目 | 選ぶもの |
|---|---|
| アプリケーションタイプ | **シングルページアプリケーション（SPA）** |
| アプリケーションに名前を付ける | `memo-app`（好きな名前でよい） |
| サインイン識別子のオプション | **メールアドレス** |
| 自己登録 | 有効にしない（ユーザーはこの節でコンソールから作る） |
| サインアップのための必須属性 | **email** |
| リターン URL | 空のまま（このハンズオンでは使わない） |

4. **ユーザーディレクトリを作成する** を押す

SPA を選ぶと、**クライアントシークレットの無い** アプリケーションクライアントが作られます。ブラウザで動くコードは誰でも中身を見られるので、秘密の値は持たせられません。そのため、シークレットを使わないクライアントにします。

## パスワードでのサインインを許可する

次の節の画面は、メールアドレスとパスワードをそのまま Cognito に送ってサインインします（`USER_PASSWORD_AUTH`）。この方式は既定では許可されていないので、足します。

1. 左のメニューの **アプリケーションクライアント** から、作った `memo-app` を開く
2. 「アプリケーションクライアントに関する情報」の **編集** を押す
3. 「認証フロー」で **ユーザー名とパスワード（ALLOW_USER_PASSWORD_AUTH）を使用してサインインします** にチェックを入れる
4. **変更を保存** を押す

認証フローに `ALLOW_USER_PASSWORD_AUTH` と `ALLOW_REFRESH_TOKEN_AUTH` が入っていれば大丈夫です（ほかの項目が入っていてもかまいません）。

## ユーザーを作る

サインインに使うユーザーを、コンソールで作ります。

1. 左のメニューの **ユーザー** を開き、**ユーザーを作成** を押す
2. 次のように入れて、**ユーザーを作成** を押す

| 項目 | 入れるもの |
|---|---|
| 招待メッセージ | **招待を送信しない** |
| E メールアドレス | 自分のメールアドレスなど（例: `alice@example.com`） |
| E メールアドレスを検証済みとしてマーク | チェックを入れる |
| 仮パスワード | **パスワードの設定** を選び、仮のパスワードを入れる（例: `Passw0rd!`） |

パスワードは、既定では「8 文字以上で、数字・記号・大文字・小文字をそれぞれ 1 文字以上」が必要です。

作ったユーザーの「確認ステータス」は **パスワードを強制的に変更** になります。コンソールで作ったユーザーは、最初のサインインで自分のパスワードに変える決まりです。次の節の画面で、新しいパスワードを決めます。

## ID を控える

次の 2 つを控えておきます。次の節で使います。

| 値 | 場所 | 形 |
|---|---|---|
| ユーザープール ID | ユーザープールの「概要」 | `ap-northeast-1_` で始まる文字列 |
| クライアント ID | 「アプリケーションクライアント」の一覧 | 英数字 26 文字くらい |

どちらも、画面（ブラウザ）に渡る値なので「秘密」ではありません。それでも、自分の AWS アカウントの情報を公開のリポジトリに載せる理由は無いので、Git には入れずに `.env` で渡します（次の節）。

:::notice
**AWS CLI で作る場合**

AWS CLI の認証情報を設定してあれば、コマンドでも作れます。`admin-set-user-password` の `--permanent` で決めたパスワードは仮ではないので、最初のサインインでパスワードを変える必要がありません。

:::::platform
::::macos-linux
```bash
aws cognito-idp create-user-pool \
  --region ap-northeast-1 \
  --pool-name memo-app \
  --username-attributes email \
  --query UserPool.Id --output text

aws cognito-idp create-user-pool-client \
  --region ap-northeast-1 \
  --user-pool-id <ユーザープール ID> \
  --client-name memo-app \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --query UserPoolClient.ClientId --output text

aws cognito-idp admin-create-user \
  --region ap-northeast-1 \
  --user-pool-id <ユーザープール ID> \
  --username alice@example.com \
  --user-attributes Name=email,Value=alice@example.com Name=email_verified,Value=true \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --region ap-northeast-1 \
  --user-pool-id <ユーザープール ID> \
  --username alice@example.com \
  --password 'Passw0rd!' \
  --permanent
```
::::
::::windows
```powershell
aws cognito-idp create-user-pool `
  --region ap-northeast-1 `
  --pool-name memo-app `
  --username-attributes email `
  --query UserPool.Id --output text

aws cognito-idp create-user-pool-client `
  --region ap-northeast-1 `
  --user-pool-id <ユーザープール ID> `
  --client-name memo-app `
  --no-generate-secret `
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH `
  --query UserPoolClient.ClientId --output text

aws cognito-idp admin-create-user `
  --region ap-northeast-1 `
  --user-pool-id <ユーザープール ID> `
  --username alice@example.com `
  --user-attributes Name=email,Value=alice@example.com Name=email_verified,Value=true `
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password `
  --region ap-northeast-1 `
  --user-pool-id <ユーザープール ID> `
  --username alice@example.com `
  --password 'Passw0rd!' `
  --permanent
```
::::
:::::

1 つ目がユーザープール ID、2 つ目がクライアント ID を表示します。
:::

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Amazon Cognito: User pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html) … ユーザープールの役割
- [Amazon Cognito: Application-specific settings with app clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) … アプリケーションクライアントと、クライアントシークレットを使わない設定
- [Amazon Cognito: Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) … `ALLOW_USER_PASSWORD_AUTH` でのサインイン
- [Amazon Cognito: Creating user accounts as administrator](https://docs.aws.amazon.com/cognito/latest/developerguide/how-to-create-user-accounts.html) … コンソールでのユーザーの作り方と、仮パスワード
- [AWS CLI: admin-set-user-password](https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/admin-set-user-password.html) … `--permanent` で仮でないパスワードにする

:::faq

### 「ユーザープールを作成」の画面が、表と違う

コンソールは画面が変わることがあります。大事なのは、(1) サインインにメールアドレスを使う、(2) クライアントシークレットが無い、(3) 認証フローに `ALLOW_USER_PASSWORD_AUTH` がある、の 3 つです。

### 使い終わったユーザープールを消したい

ユーザープールを開き、右上の **削除** から消せます。削除保護が有効なときは、先に「設定」で削除保護を無効にします。

:::
