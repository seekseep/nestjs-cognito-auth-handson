# 02-02 Podman で動かす

API を Podman のコンテナで動かせるようにした状態です。

## 動かし方

```bash
cd api
podman compose up -d --build --wait   # http://localhost:3000
```
