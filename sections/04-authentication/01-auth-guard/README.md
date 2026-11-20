# 04-01 認証 — トークンを検証する

API がアクセストークンを検証し、トークンが無い・正しくない呼び出しを 401 で断るようにした状態です。

## 動かし方

`.env.example` をコピーして `api/.env` を作り、自分のユーザープール ID とクライアント ID に書き換えてから起動します。

```bash
cd api
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3000
```
