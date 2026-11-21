# 04-01 SQLite を用意する

SQLite のデータベース（ボリュームの `notes.db`）を開き、`notes` テーブルを作る状態です。

## 動かし方

```bash
cd api
npm install
podman compose up -d --build --wait   # 画面は http://localhost:3000 、API は http://localhost:3001
```
