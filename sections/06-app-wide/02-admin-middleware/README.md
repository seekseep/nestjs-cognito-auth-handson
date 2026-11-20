# 06-02 /admin を middleware で守る

`/admin` の下を、middleware で admin グループの人だけにした状態です。

## 動かし方

`.env.example` をコピーして `api/.env` を作り、自分のユーザープール ID とクライアント ID に書き換えてから起動します。

```bash
cd api
npm install
cp .env.example .env
npm run start:dev      # http://localhost:3000
```
