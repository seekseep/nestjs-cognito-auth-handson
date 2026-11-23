// Floci の Cognito に、ユーザープールとアプリケーションクライアントを作り、ID を書き出す。
// Floci は止めるとデータが消えるので、Floci を起動し直したらもう一度実行する。
import { readFile, writeFile } from 'node:fs/promises';

const endpoint = 'http://localhost:4566';

// Cognito の API を 1 つ呼ぶ。Floci は AWS の認証情報を確かめないので、付けずに呼べる
async function cognito(action, params) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-amz-json-1.1',
      'x-amz-target': `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify(params),
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(`${action}: ${json.__type} ${json.message}`);
  return json;
}

// Pre Token Generation の Lambda の関数。lambda.zip（lambda/index.mjs を zip にしたもの）から作る
const lambda = await fetch(`${endpoint}/2015-03-31/functions`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    FunctionName: 'pre-token',
    Runtime: 'nodejs22.x',
    Role: 'arn:aws:iam::000000000000:role/lambda-role',
    Handler: 'index.handler',
    Code: { ZipFile: (await readFile('lambda.zip')).toString('base64') },
  }),
});
const { FunctionArn } = await lambda.json();

// ユーザープール。メールアドレスでサインインし、サインアップのときにメールで確認コードを送る。
// トークンを作る前に、上の Lambda を呼ぶ（V2_0 だと、アクセストークンにクレームを足せる）
const { UserPool } = await cognito('CreateUserPool', {
  PoolName: 'notes',
  UsernameAttributes: ['email'],
  AutoVerifiedAttributes: ['email'],
  LambdaConfig: {
    PreTokenGenerationConfig: { LambdaArn: FunctionArn, LambdaVersion: 'V2_0' },
  },
});

// アプリケーションクライアント。ブラウザは秘密を守れないので、クライアントシークレットは持たせない。
// メールアドレスとパスワードでのログイン（USER_PASSWORD_AUTH）を許す
const { UserPoolClient } = await cognito('CreateUserPoolClient', {
  UserPoolId: UserPool.Id,
  ClientName: 'notes',
  GenerateSecret: false,
  ExplicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
});

// 管理者のグループ（admin）と、そこに入れる管理者のユーザー（admin@example.com）
await cognito('CreateGroup', { UserPoolId: UserPool.Id, GroupName: 'admin' });
await cognito('AdminCreateUser', {
  UserPoolId: UserPool.Id,
  Username: 'admin@example.com',
  UserAttributes: [
    { Name: 'email', Value: 'admin@example.com' },
    { Name: 'email_verified', Value: 'true' },
  ],
  MessageAction: 'SUPPRESS',
});
await cognito('AdminSetUserPassword', {
  UserPoolId: UserPool.Id,
  Username: 'admin@example.com',
  Password: 'Passw0rd!',
  Permanent: true,
});
await cognito('AdminAddUserToGroup', {
  UserPoolId: UserPool.Id,
  Username: 'admin@example.com',
  GroupName: 'admin',
});

// API が読む設定（.env）。PODMAN_SOCKET など、ほかの行は残す
const others = (await readFile('.env', 'utf8').catch(() => ''))
  .split('\n')
  .filter((line) => line && !line.startsWith('COGNITO_'));
await writeFile(
  '.env',
  [...others, `COGNITO_USER_POOL_ID=${UserPool.Id}`, `COGNITO_CLIENT_ID=${UserPoolClient.ClientId}`, ''].join('\n'),
);
// 画面が読む設定。どのユーザープールに、どのクライアントとしてログインするか（どれもブラウザに渡る値で、秘密ではない）
await writeFile(
  'apps/ui/config.json',
  `${JSON.stringify({ issuer: `${endpoint}/${UserPool.Id}`, clientId: UserPoolClient.ClientId })}\n`,
);
console.log(
  `ユーザープール ${UserPool.Id} とクライアント ${UserPoolClient.ClientId}、admin グループと admin@example.com を作り、.env と apps/ui/config.json に書きました`,
);
