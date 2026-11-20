// Floci の Cognito に、ユーザープール・アプリケーションクライアント・ユーザー・グループを作り、
// ID を .env に書き出す。Floci は止めるとデータが消えるので、起動し直したらもう一度実行する。
import { writeFile } from 'node:fs/promises';

const endpoint = 'http://localhost:4566';
const password = 'Passw0rd!';

// Cognito の API を 1 つ呼ぶ。Floci は AWS の認証情報（署名）を確かめないので、付けずに呼べる
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

// ユーザープール。メールアドレスでサインインする
const { UserPool } = await cognito('CreateUserPool', {
  PoolName: 'memo-app',
  UsernameAttributes: ['email'],
});
const userPoolId = UserPool.Id;

// アプリケーションクライアント。ブラウザは秘密を守れないので、クライアントシークレットは持たせない。
// メールアドレスとパスワードでのサインイン（USER_PASSWORD_AUTH）を許可する
const { UserPoolClient } = await cognito('CreateUserPoolClient', {
  UserPoolId: userPoolId,
  ClientName: 'memo-app',
  GenerateSecret: false,
  ExplicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
});
const clientId = UserPoolClient.ClientId;

// ユーザー。パスワードは仮ではなく、そのままサインインに使えるもの（Permanent）にする
for (const email of ['alice@example.com', 'bob@example.com']) {
  await cognito('AdminCreateUser', {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ],
    MessageAction: 'SUPPRESS',
  });
  await cognito('AdminSetUserPassword', {
    UserPoolId: userPoolId,
    Username: email,
    Password: password,
    Permanent: true,
  });
}

// admin グループを作り、alice を入れる（05 章で使う）
await cognito('CreateGroup', { UserPoolId: userPoolId, GroupName: 'admin' });
await cognito('AdminAddUserToGroup', {
  UserPoolId: userPoolId,
  Username: 'alice@example.com',
  GroupName: 'admin',
});

await writeFile(
  '.env',
  [
    `COGNITO_ENDPOINT=${endpoint}`,
    `COGNITO_USER_POOL_ID=${userPoolId}`,
    `COGNITO_USER_POOL_CLIENT_ID=${clientId}`,
    '',
  ].join('\n'),
);
console.log(
  `ユーザープール ${userPoolId}・クライアント ${clientId} を作り、.env に書きました`,
);
console.log(
  `ユーザー: alice@example.com（admin）・bob@example.com、パスワードはどちらも ${password}`,
);
