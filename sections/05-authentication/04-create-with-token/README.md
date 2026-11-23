# 05-04 トークンを付けて作る

作ったノートに、作った人（トークンの `sub`）が入る状態です。

## 動かし方

```bash
cd apps/api
npm install
cd ../..
podman compose up -d --build --wait
node apps/api/scripts/setup-cognito.js   # ユーザープールを作り、.env と apps/ui/config.json に書く
podman compose up -d --wait      # 画面は http://localhost:3000 、API は http://localhost:3001
```

サインアップは http://localhost:3000/signup.html 、確認コードは http://localhost:4566/_aws/ses 、ログインは http://localhost:3000/login.html 、ノートの一覧は http://localhost:3000/notes.html です。
