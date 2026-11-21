# 07-03 認証を middleware にする

トークンの確認を `AuthMiddleware` にまとめた状態です。

## 動かし方

```bash
cd api
npm install
podman compose up -d --build --wait
node scripts/setup-cognito.mjs   # ユーザープールを作り、.env と public/config.json に書く
podman compose up -d --wait      # 画面は http://localhost:3000 、API は http://localhost:3001
```

サインアップは http://localhost:3000/signup.html 、確認コードは http://localhost:4566/_aws/ses 、ログインは http://localhost:3000/login.html 、ノートの一覧は http://localhost:3000/notes.html です。
