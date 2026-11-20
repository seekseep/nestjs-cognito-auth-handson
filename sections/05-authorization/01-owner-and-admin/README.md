# 05-01 認可 — 持ち主とグループ

メモに持ち主（Cognito の `sub`）を持たせ、他の人のメモは 403 にした状態です。`admin` グループの人は全員のメモを扱えます。

## 動かし方

`.env.example` をコピーして `api/.env` を作り、自分のユーザープール ID とクライアント ID に書き換えてから起動します。

```bash
cd api
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3000
```
