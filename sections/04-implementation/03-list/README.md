# 04-03 一覧を実装する

`GET /notes` と、一覧の画面（http://localhost:3000/notes.html）がある状態です。

## 動かし方

```bash
cd apps/api
npm install
cd ../..
podman compose up -d --build --wait   # 画面は http://localhost:3000 、API は http://localhost:3001
```
