import { cognitoEndpoint, config } from './config.js';

// 画面から Cognito の API を 1 つ呼ぶ。
// サインアップやログインの API は、AWS の認証情報なしで、クライアント ID だけで呼べる
export async function cognito(action, params) {
  const response = await fetch(cognitoEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-amz-json-1.1',
      'x-amz-target': `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify({ ClientId: config.clientId, ...params }),
  });
  const json = await response.json();
  // 失敗すると {"__type":"UsernameExistsException","message":"..."} の形で返る
  if (!response.ok) throw new Error(`${json.__type}: ${json.message}`);
  return json;
}
