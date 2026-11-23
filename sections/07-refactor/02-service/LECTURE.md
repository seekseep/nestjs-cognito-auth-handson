---
docs: true
title: 処理をサービスに分ける
---

# 処理をサービスに分ける

![07 章 処理をサービスに分ける](./images/00-thumbnail.svg)

SQL と処理（認可の判定も）を **サービス** に移し、コントローラーは「トークンを確かめて、サービスを呼んで、返す」だけにします。データベースは、コントローラーではなくサービスに注入します。

![SQL と処理が NotesService に分かれる。DatabaseSync は NotesService に、NotesService は NotesController に注入される](./images/01-structure.svg)

```bash
cd apps/api
npx nest g service notes --no-spec
cd ../..
```

```text
CREATE src/notes/notes.service.ts (89 bytes)
UPDATE src/app.module.ts (484 bytes)
```

`AppModule` の `providers` に `NotesService` が登録されます。

::diff{file="apps/api/src/app.module.ts" by="command"}

::diff{file="apps/api/src/notes/notes.service.ts" base="generated"}

- メソッドの中身は、コントローラーにあったものをそのまま移しています。作った人の ID と、トークンの中身（`user`）は、引数で受け取ります
- 認可（作った人・`admin`・同じチーム）は、消すノートの `ownerId`・`teamId` を読んでから決めるので、ノートを読むサービスに置きます
- データベースは、サービスのコンストラクターで受け取ります

::diff{file="apps/api/src/notes/notes.controller.ts"}

- トークンの確認（`verifyToken`）と応答のステータス（`@HttpCode(204)`）は、HTTP の決まりなのでコントローラーに残します

## 動作確認する

`podman compose up -d --build --wait` で作り直して起動し、06 章の最後と同じように curl で送ります。alice が作ったノートに対して、次のとおりになれば、整理しても動きは変わっていません。

| 呼び出し | 返るもの |
|---|---|
| トークン無しで作る | `401` |
| alice のトークンで作る | `201` |
| bob のトークンで消す（チームの無いノート） | `403` |
| admin のトークンで消す | `204` |
| bob のトークンで消す（bob が入っている `team-a` のノート） | `204` |

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: Providers](https://docs.nestjs.com/providers) … サービス（`@Injectable()`）と依存性の注入

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
