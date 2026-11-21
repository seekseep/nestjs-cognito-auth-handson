// Floci の Cognito に、ユーザープールとアプリケーションクライアントを作り、ID を書き出す。
// Floci は止めるとデータが消えるので、Floci を起動し直したらもう一度実行する。
import { writeFile } from 'node:fs/promises';

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

// ユーザープール。メールアドレスでサインインし、サインアップのときにメールで確認コードを送る
const { UserPool } = await cognito('CreateUserPool', {
  PoolName: 'notes',
  UsernameAttributes: ['email'],
  AutoVerifiedAttributes: ['email'],
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

// API が読む設定（.env）
await writeFile(
  '.env',
  `COGNITO_USER_POOL_ID=${UserPool.Id}\nCOGNITO_CLIENT_ID=${UserPoolClient.ClientId}\n`,
);
// 画面が読む設定。どのユーザープールに、どのクライアントとしてログインするか（どれもブラウザに渡る値で、秘密ではない）
await writeFile(
  'public/config.json',
  `${JSON.stringify({ issuer: `${endpoint}/${UserPool.Id}`, clientId: UserPoolClient.ClientId })}\n`,
);
console.log(
  `ユーザープール ${UserPool.Id} とクライアント ${UserPoolClient.ClientId}、admin グループと admin@example.com を作り、.env と public/config.json に書きました`,
);
