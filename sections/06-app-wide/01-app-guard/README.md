# 06-01 アプリ全体に Guard を掛ける

Guard をアプリ全体に掛け、トークン無しで呼べるものだけに `@Public()` を付けた状態です。

## 動かし方

Podman で Cognito のエミュレーター Floci を起動し、ユーザープールとユーザーを作ってから（`api/.env` ができます）、API を起動します。

```bash
cd api
npm install
npm run floci:up
npm run cognito:setup
npm run start:dev      # http://localhost:3000
```

ユーザーは `alice@example.com`（admin）と `bob@example.com`、パスワードはどちらも `Passw0rd!` です。
