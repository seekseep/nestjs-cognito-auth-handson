---
docs: true
title: 開発ツール（VS Code / ブラウザ）
sidebar:
  label: 開発ツール
  order: 3
---

# 開発ツール（VS Code / ブラウザ）

ハンズオンを進めるうえで使うエディタとブラウザについてまとめます。

## VS Code

エディタには [Visual Studio Code](https://code.visualstudio.com/) を使います。コードの編集と同じウィンドウでターミナルを使えるので、起動コマンドの実行とコードの確認を行き来しやすくなります。入れ方は [道具をそろえる](./01-setup/01-tools/LECTURE.md) の節にあります。

### プロジェクトを開く

`api/` のフォルダで次を実行するか、VS Code の **ファイル → フォルダーを開く** から開きます。

```bash
code .
```

### ターミナルを開く

`` Ctrl + ` ``（バッククォート）でエディタの中にターミナルが開きます。API を動かしたまま curl を打つときは、右上の **＋** でターミナルをもう 1 つ開いて使い分けます。

### 入れておくと便利な拡張機能

| 拡張機能 | 用途 |
|---|---|
| Prettier | NestJS のプロジェクトに入っている Prettier で整形する |
| oxc | NestJS のプロジェクトに入っている oxlint の指摘をエディタに出す |

## ブラウザの開発者ツール

アプリの動きを確かめるときは、ブラウザの開発者ツール（DevTools）を使います。Chrome / Edge / Firefox のどれでも `F12` か、右クリック → 「検証」で開けます。

- **Network タブ** — API と Cognito へのリクエストとレスポンス、ステータスコード、`Authorization` ヘッダーを確かめる
- **Console タブ** — エラーやログを確かめる
- **Application タブ**（Chrome）— 画面が `sessionStorage` に置いたアクセストークンを確かめる
