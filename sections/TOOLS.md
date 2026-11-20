---
docs: true
title: 開発ツール（ブラウザ / コンテナ）
sidebar:
  label: 開発ツール
  order: 3
---

# 開発ツール（ブラウザ / コンテナ）

## ブラウザの開発者ツール

サインアップ画面やログイン画面がうまく動かないときは、`F12` で開発者ツールを開きます。

- **Network タブ** — Cognito（`localhost:4566`）へのリクエストと、返ってきたエラー（`__type` と `message`）を確かめる
- **Console タブ** — 画面のエラーを確かめる

## コンテナのようす

`api/` で実行します。

```bash
podman compose ps            # 動いているコンテナ
podman compose logs api      # API のログ（エラーの中身）
podman compose logs floci    # Floci のログ
```
