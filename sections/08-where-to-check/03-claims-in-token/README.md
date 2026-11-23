# 08-03 トークンに持たせる

ログインのとき、Pre Token Generation の Lambda が所属をアクセストークンの `teams` に載せ、API はそれで所属の認可をする状態です。

## 動かし方

```bash
cd apps/api
npm install
cd ../..
echo "PODMAN_SOCKET=$(podman info --format '{{.Host.RemoteSocket.Path}}' | sed 's|unix://||')" >> .env
zip -j lambda.zip apps/api/lambda/index.mjs
podman compose up -d --build --wait
node apps/api/scripts/setup-cognito.js   # Lambda・ユーザープール・admin グループ・admin@example.com を作り、.env と apps/ui/config.json に書く
podman compose up -d --wait      # 画面は http://localhost:3000 、API は http://localhost:3001
```

Windows（PowerShell 7）では、`echo` の行を `"PODMAN_SOCKET=$((podman info --format '{{.Host.RemoteSocket.Path}}') -replace 'unix://', '')" | Add-Content .env` に、`zip` の行を `Compress-Archive -Path apps/api/lambda/index.mjs -DestinationPath lambda.zip -Force` にします。

サインアップは http://localhost:3000/signup.html 、確認コードは http://localhost:4566/_aws/ses 、ログインは http://localhost:3000/login.html 、ノートの一覧は http://localhost:3000/notes.html です。管理者は `admin@example.com`（パスワード `Passw0rd!`）です。チームに入れるときは `podman compose exec api node scripts/team-member.js add bob@example.com team-a` です（所属が効くのは、次にログインしたトークンからです）。
