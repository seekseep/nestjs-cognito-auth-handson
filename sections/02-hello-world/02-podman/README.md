# 02-02 Podman で動かす

API（NestJS）と、画面を配る nginx を Podman で動かす状態です。

## 動かし方

```bash
cd apps/api
npm install
cd ../..
podman compose up -d --build --wait   # 画面は http://localhost:3000 、API は http://localhost:3001
```
