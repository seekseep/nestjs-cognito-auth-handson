# 04-04 削除を実装する

`DELETE /notes/{id}` でノートを消せる状態です。

## 動かし方

```bash
cd apps/api
npm install
cd ../..
podman compose up -d --build --wait   # 画面は http://localhost:3000 、API は http://localhost:3001
```
