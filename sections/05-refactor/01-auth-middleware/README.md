# 05-01 認証部分をミドルウェアにする

トークンの確認を middleware にまとめた状態です。

## 動かし方

```bash
cd api
podman compose up -d --build --wait
node scripts/setup-cognito.mjs   # ユーザープールを作り、.env に書く
podman compose up -d --wait      # http://localhost:3000
```

サインアップは http://localhost:3000/signup.html 、確認コードは http://localhost:4566/_aws/ses 、ログインは http://localhost:3000/login.html です。

ノートの一覧の画面は http://localhost:3000/notes.html です。
