---
docs: true
title: Node.js だけで Hello World
---

# Node.js だけで Hello World

![02 章 Node.js だけで Hello World](./images/00-thumbnail.svg)

NestJS のプロジェクトを作り、手元の Node.js で動かして、`Hello World!` を返す API を確かめます。

## プロジェクトを作る

作業するフォルダで、NestJS のプロジェクトを `api/` に作ります。

```bash
npx @nestjs/cli@12 new api --package-manager npm --skip-git --skip-tests --type esm --no-observe --skip-skills
cd api
```

`--skip-git` で Git のリポジトリを作らず、`--skip-tests` でテストのファイルを作らず、`--type esm` でモジュールの方式を ESM にし、`--no-observe` で監視サービス（NestJS Observe）の設定を、`--skip-skills` でコーディングエージェント向けのファイルを飛ばします。`--type`・`--no-observe`・`--skip-skills` は、付けないと作るときに聞かれます。

このハンズオンでは使わない、テスト・lint・整形のファイルとライブラリを消します。

:::::platform
::::macos-linux
```bash
rm vitest.config.ts vitest.config.e2e.ts .oxlintrc.json .prettierrc .gitattributes AGENTS.md README.md
```
::::
::::windows
```powershell
Remove-Item vitest.config.ts, vitest.config.e2e.ts, .oxlintrc.json, .prettierrc, .gitattributes, AGENTS.md, README.md
```
::::
:::::

```bash
npm uninstall @nestjs/mau @nestjs/testing @types/supertest supertest @vitest/coverage-v8 vitest vite oxlint oxlint-tsgolint prettier source-map-support
npm pkg delete scripts.deploy scripts.format scripts.start:debug scripts.start:prod scripts.lint scripts.test scripts.test:watch scripts.test:cov scripts.test:debug scripts.test:e2e
```

`nest new` が入れる Node.js の型（`@types/node`）は 24 用なので、このハンズオンで使う Node.js 26 用に入れ替えます。

```bash
npm install -D @types/node@26
```

`tsconfig.json` の `types` から、Vitest の型を外します。

```diff lang="json"
-    "types": ["vitest/globals", "node"]
+    "types": ["node"]
```

残ったファイルは、この節の最後のエディタで見られます。

| ファイル | 役割 |
|---|---|
| `src/main.ts` | 起動するところ。`AppModule` からアプリを作り、ポート 3000 で待ち受ける |
| `src/app.module.ts` | アプリ全体のモジュール。使うコントローラーとサービスを並べる |
| `src/app.controller.ts` | `@Get()` で、`GET /` を `getHello()` に結び付ける |
| `src/app.service.ts` | `Hello World!` を返す |

## 動かす

```bash
npm run start:dev
```

```text
[Nest] 12345  - ... LOG [NestApplication] Nest application successfully started
```

`start:dev` は、ファイルを保存するたびに起動し直すモードです。ターミナルをもう 1 つ開いて呼びます。

```bash
curl http://localhost:3000/
```

```text
Hello World!
```

確かめたら、Ctrl + C で止めます。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: First steps](https://docs.nestjs.com/first-steps) … `nest new` が作るファイルと `npm run start:dev`
- [NestJS: CLI command reference](https://docs.nestjs.com/cli/usages) … `nest new` の `--skip-git`・`--skip-tests`・`--type`・`--no-observe`・`--skip-skills`
- [NestJS: Controllers](https://docs.nestjs.com/controllers) … `@Controller()` と `@Get()`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
