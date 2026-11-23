# 07-02 処理をサービスに分ける

SQL と処理（認可の判定も）を `NotesService` に分けた状態です。

## 動かし方

```bash
cd apps/api
npm install
cd ../..
podman compose up -d --build --wait
node apps/api/scripts/setup-cognito.mjs   # ユーザープール・admin グループ・admin@example.com を作り、.env と apps/ui/config.json に書く
podman compose up -d --wait      # 画面は http://localhost:3000 、API は http://localhost:3001
```

サインアップは http://localhost:3000/signup.html 、確認コードは http://localhost:4566/_aws/ses 、ログインは http://localhost:3000/login.html 、ノートの一覧は http://localhost:3000/notes.html です。 管理者は `admin@example.com`（パスワード `Passw0rd!`）です。

チームに入れるときは `podman compose exec api node scripts/team-member.mjs add bob@example.com team-a` です。
