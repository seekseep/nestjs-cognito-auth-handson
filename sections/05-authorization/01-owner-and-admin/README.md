# 05-01 認可 — 持ち主とグループ

メモに持ち主（Cognito の `sub`）を持たせ、他の人のメモは 403 にした状態です。`admin` グループの人は全員のメモを扱えます。

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
