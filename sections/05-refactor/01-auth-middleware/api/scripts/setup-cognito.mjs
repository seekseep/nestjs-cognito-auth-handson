// Floci の Cognito に、ユーザープールとアプリケーションクライアントを作り、ID を .env に書く。
// Floci は止めるとデータが消えるので、Floci を起動し直したらもう一度実行する。
import { writeFile } from 'node:fs/promises';

// Cognito の API を 1 つ呼ぶ。Floci は AWS の認証情報を確かめないので、付けずに呼べる
async function cognito(action, params) {
  const response = await fetch('http://localhost:4566', {
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

await writeFile(
  '.env',
  `COGNITO_USER_POOL_ID=${UserPool.Id}\nCOGNITO_CLIENT_ID=${UserPoolClient.ClientId}\n`,
);
console.log(
  `ユーザープール ${UserPool.Id} とクライアント ${UserPoolClient.ClientId} を作り、.env に書きました`,
);
