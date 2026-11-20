---
docs: true
title: NestJS と Amazon Cognito で認証と認可
---

# NestJS と Amazon Cognito で認証と認可

NestJS で作ったメモの REST API に、**Amazon Cognito でのサインイン** と、**認証**（誰からの呼び出しかを確かめる）・**認可**（その人にその操作をさせてよいかを確かめる）を足していくハンズオンです。

- **API** — NestJS。メモの一覧・作成・更新・削除ができる REST API
- **画面** — HTML 1 枚。NestJS が API といっしょに配ります。`fetch` で API と Cognito を呼びます
- **認証の仕組み** — Amazon Cognito のユーザープール。API は Cognito が発行したアクセストークンを検証します

メモの REST API ができあがった状態から始めます。そのプロジェクトは 02 章で ZIP で配ります。

## このハンズオンで作るもの

```text
ブラウザ（index.html）
  ├─ サインイン ──────────▶ Amazon Cognito（ユーザープール）
  │   ◀── アクセストークン ──┘
  └─ Authorization: Bearer <アクセストークン> を付けて呼ぶ
                              ▼
                     NestJS（http://localhost:3000）
                       トークンを検証し（認証）、
                       持ち主か admin かを確かめる（認可）
```

| 章 | すること |
|---|---|
| 01. 準備 | Node.js 26・VS Code・AWS アカウントを用意する |
| 02. はじめのプロジェクト | メモの REST API と HTML 1 枚のプロジェクトを受け取って動かす |
| 03. Cognito でサインイン | ユーザープールを作り、HTML からサインインしてアクセストークンを付けて API を呼ぶ |
| 04. 認証 | トークンを検証する Guard を足し、トークンが無い・正しくない呼び出しを `401` で断る |
| 05. 認可 | 他の人のメモを `403` にし、`admin` グループの人は全員のメモを扱えるようにする |
| 06. アプリ全体に掛ける | Guard をアプリ全体に掛けて `@Public()` で開け、`/admin` の下を middleware で守る |

## ほかのハンズオンとの関係

NestJS のハンズオンは 3 本に分かれていて、どれから始めても進められます。

| ハンズオン | 内容 |
|---|---|
| [基本的な REST API](https://github.com/seekseep/nestjs-rest-api-handson) | NestJS でメモの API を作る |
| NestJS と Cognito で認証と認可（このハンズオン） | Amazon Cognito のトークンで認証し、持ち主とグループで認可する |
| [NestJS のテスト](https://github.com/seekseep/nestjs-testing-handson) | 単体テスト・結合テスト・E2E テストを書く |

## ドキュメントサイト

各節の解説は GitHub Pages で読めます: <https://seekseep.github.io/nestjs-cognito-auth-handson/>

Cognito のユーザープール ID などの実値はリポジトリに含めていません。各自で作り、`api/.env` に書いてください。
