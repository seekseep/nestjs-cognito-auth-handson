---
docs: true
title: NestJS と Amazon Cognito で認証と認可
---

# NestJS と Amazon Cognito で認証と認可

NestJS で、ノートの作成・一覧・削除だけの小さな API を作り、**Amazon Cognito** のトークンで **認証**（誰からの呼び出しかを確かめる）と **認可**（その人にその操作をさせてよいかを確かめる）を足していくハンズオンです。

- **API** — NestJS。ノートの作成（ログインした人だけ）・一覧（誰でも）・削除（作った人だけ）
- **画面** — サインアップとログインの HTML。`fetch` で Cognito を直接呼びます
- **Cognito** — エミュレーターの [Floci](https://floci.io/) を使います。API と Floci を Podman で手元に動かすので、AWS のアカウントは要りません

## このハンズオンで作るもの

```text
ブラウザ（signup.html・login.html）
  ├─ サインアップ・ログイン ──▶ Cognito（Floci: http://localhost:4566）
  │   ◀── アクセストークン ──┘
curl
  └─ Authorization: Bearer <アクセストークン> を付けて呼ぶ
                              ▼
                     NestJS（http://localhost:3000）
                       POST /notes        … トークンが無ければ 401
                       GET /notes         … 誰でも
                       DELETE /notes/:id  … 作った人でなければ 403
```

| 章 | すること |
|---|---|
| 01. 準備 | Node.js・Podman・VS Code を用意する |
| 02. エンドポイントを作る | Hello World を Node.js で、次に Podman で動かし、ノートの作成・一覧・削除を作る |
| 03. 認証する | サインアップ画面・ログイン画面を作り、トークンが無いとノートを作れないようにする |
| 04. 認可する | ノートを作った人だけが消せるようにし、別の人では 403、作った人では成功することを確かめる |
| 05. 整理する | トークンの確認を middleware にまとめる |

## 関連するハンズオン

NestJS のハンズオンは 3 本に分かれていて、どれから始めても進められます。3 本のつながりは [関連するハンズオン](./sections/RELATED.md) にまとめています。

- [NestJS で作る REST API](https://github.com/seekseep/nestjs-rest-api-handson)
- NestJS と Cognito で認証と認可（このハンズオン）
- [NestJS のテスト](https://github.com/seekseep/nestjs-testing-handson)

## ドキュメントサイト

各節の解説は GitHub Pages で読めます: <https://seekseep.github.io/nestjs-cognito-auth-handson/>

