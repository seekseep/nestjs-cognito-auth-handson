# 04-01 認可されたものしか削除できないようにする

ノートを作った人だけが、そのノートを消せる状態です。

## 動かし方

```bash
cd api
podman compose up -d --build --wait
node scripts/setup-cognito.mjs   # ユーザープールを作り、.env に書く
podman compose up -d --wait      # http://localhost:3000
```

サインアップは http://localhost:3000/signup.html 、確認コードは http://localhost:4566/_aws/ses 、ログインは http://localhost:3000/login.html です。
