---
docs: true
title: トークンを付けて作る
---

# トークンを付けて作る

![05 章 トークンを付けて作る](./images/00-thumbnail.svg)

アクセストークンを付けてノートを作ります。作ったノートの `ownerId` には、トークンの `sub`（ユーザーの ID）を入れます。

::diff{file="apps/api/src/notes/notes.controller.ts"}

- `const user = await verifyToken(authorization)` … 正しいトークンなら、トークンの中身が返ります
- `ownerId: user.sub` … 作った人を、ノートに入れます

## 動作確認する

```bash
podman compose up -d --build --wait
```

<http://localhost:3000/login.html> でログインし、出たアクセストークンを、次の `<アクセストークン>` に置き換えて送ります。

```bash
curl -i -X POST http://localhost:3001/notes -H 'Authorization: Bearer <アクセストークン>' -H 'Content-Type: application/json' -d '{"title": "買い物", "body": "牛乳を買う"}'
```

1 行目が `HTTP/1.1 201 Created` で、最後の行に、`ownerId` が入ったノートが出れば大丈夫です。

```json
{"id":"21a481a3-b808-4653-a833-89ffe6a9db37","title":"買い物","body":"牛乳を買う","createdAt":"2026-11-21T14:18:41.546Z","updatedAt":"2026-11-21T14:18:41.546Z","ownerId":"d832d8cd-0bd3-454f-96ce-fef826eab16e"}
```

<http://localhost:3000/notes.html> を開くと、作ったノートが一覧に出ます。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Amazon Cognito: Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) … アクセストークンの `sub`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::

:::faq

### トークンを付けても `401` で `Invalid token` と出る

トークンの期限が切れているか、Floci を起動し直したあとの古いトークンです。ログインし直して、新しいトークンで送ってください。Floci を起動し直したときは、`node apps/api/scripts/setup-cognito.mjs` とサインアップからやり直します。

:::
