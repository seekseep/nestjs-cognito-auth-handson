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
npx @nestjs/cli@12 new api --package-manager npm --skip-git
cd api
```

このハンズオンでは使わない、テスト・lint・整形のファイルとライブラリを消します。

:::::platform
::::macos-linux
```bash
rm -rf test src/app.controller.spec.ts vitest.config.ts vitest.config.e2e.ts .oxlintrc.json .prettierrc .gitattributes AGENTS.md README.md
```
::::
::::windows
```powershell
Remove-Item -Recurse -Force test, src/app.controller.spec.ts, vitest.config.ts, vitest.config.e2e.ts, .oxlintrc.json, .prettierrc, .gitattributes, AGENTS.md, README.md
```
::::
:::::

```bash
npm uninstall @nestjs/mau @nestjs/testing @types/supertest supertest @vitest/coverage-v8 vitest vite oxlint oxlint-tsgolint prettier
npm pkg delete scripts.deploy scripts.format scripts.start:debug scripts.start:prod scripts.lint scripts.test scripts.test:watch scripts.test:cov scripts.test:debug scripts.test:e2e
```

最後に、`tsconfig.json` の `"types": ["vitest/globals", "node"]` を `"types": ["node"]` に書き換えます（Vitest を消したため）。

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

確かめたら、`Ctrl+C` で止めます。

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [NestJS: First steps](https://docs.nestjs.com/first-steps) … `nest new` が作るファイルと `npm run start:dev`
- [NestJS: Controllers](https://docs.nestjs.com/controllers) … `@Controller()` と `@Get()`

## この節を終えたときのディレクトリ

::tree

:::download
[この節を終えた状態をダウンロード](./project.zip)
:::
