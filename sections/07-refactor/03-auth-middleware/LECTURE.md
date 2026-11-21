---
docs: true
title: 認証を middleware にする
---

# 認証を middleware にする

![07 章 認証を middleware にする](./images/00-thumbnail.svg)

作成と削除の両方で、コントローラーが最初に `verifyToken()` を呼んでいます。この確認を **middleware** にまとめ、コントローラーに届く前に済ませます。

![トークンの確認が AuthMiddleware に分かれ、NotesController より先に動く。SQL と処理は NotesService、データベースは DatabaseModule の DatabaseSync に分かれている](./images/01-structure.svg)

::diff{file="api/src/auth/auth.middleware.ts"}

- `req.user = await verifyToken(...)` … 正しければトークンの中身を `req.user` に入れて `next()` で先へ進めます。正しくなければ `verifyToken` が `401` にします

作成と削除にだけ掛けます。一覧は誰でも見られるので掛けません。

::diff{file="api/src/app.module.ts"}

- `forRoutes()` … middleware を掛ける URL とメソッドを選びます

::diff{file="api/src/notes/notes.controller.ts"}

- `@Req() req: AuthenticatedRequest` … middleware が入れた `req.user` から、ユーザーの `sub` を読みます

## 動作確認する

`podman compose up -d --build --wait` で作り直して起動し、06 章の最後と同じように curl で送ります。トークンが無い作成は `401`、alice のトークンでの作成は `201`、bob のトークンでの削除は `403`、alice のトークンでの削除は `204` になれば、整理しても動きは変わっていません。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Middleware](https://docs.nestjs.com/middleware) … `NestMiddleware` と、`consumer.apply().forRoutes()` で掛ける URL とメソッドを選ぶ

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
