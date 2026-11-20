# 06-01 アプリ全体に Guard を掛ける

Guard をアプリ全体に掛け、トークン無しで呼べるものだけに `@Public()` を付けた状態です。

## 動かし方

`.env.example` をコピーして `api/.env` を作り、自分のユーザープール ID とクライアント ID に書き換えてから起動します。

```bash
cd api
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3000
```

テストは `npm test` です。
