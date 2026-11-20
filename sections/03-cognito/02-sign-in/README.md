# 03-02 HTML からサインインする

HTML にサインインのフォームを足し、Cognito から受け取ったアクセストークンを付けて API を呼ぶようにした状態です。

## 動かし方

`.env.example` をコピーして `api/.env` を作り、自分のユーザープール ID とクライアント ID に書き換えてから起動します。

```bash
cd api
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3000
```
