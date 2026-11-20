---
docs: true
title: 進め方
sidebar:
  label: 進め方
  order: 0
---

# 進め方

## 1 つのプロジェクトを育てる

02 章で受け取ったプロジェクトに、節ごとに機能を足していきます。手元では 1 つのフォルダ（たとえば `~/handson/api/`）を、各節のページの手順どおりに書き換えていきます。

## ページの読み方

### コードの差分

ファイルを書き換える手順は、前の節との差分で示します。行頭が `+` の行を足し、`-` の行を消します。新しく作るファイルは、すべての行に `+` が付きます。

```diff lang="ts"
 @Controller('notes')
+@UseGuards(AuthGuard)
 export class NotesController {
```

### この節を終えたときのディレクトリ

ページの最後に、その節を終えたときのディレクトリを載せています。前の節から追加・変更したファイルには印が付いています。その下のボタンから、その節を終えた状態のプロジェクトを ZIP でダウンロードできます。

- 途中の節から始めたいときは、ひとつ前の節の ZIP を展開し、`api/` で `npm install` を実行します
- 03 章からは、`npm run floci:up` で Floci を起動し、`npm run cognito:setup` でユーザープールと `api/.env` を作ります

## 前提

- macOS / Windows（PowerShell 7）/ Linux のどれか
- ターミナルの基本的な操作（`cd`・`ls`）ができる
- JavaScript を書いたことがある
