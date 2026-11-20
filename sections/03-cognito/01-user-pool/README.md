# 03-01 ユーザープールを作る

Cognito のエミュレーター Floci を Podman で動かし、ユーザープール・アプリケーションクライアント・ユーザーを作るスクリプトを足した状態です。

## 動かし方

```bash
cd api
npm install
npm run floci:up
npm run cognito:setup  # api/.env ができる
npm run start:dev      # http://localhost:3000
```

ユーザーは `alice@example.com`（admin）と `bob@example.com`、パスワードはどちらも `Passw0rd!` です。
