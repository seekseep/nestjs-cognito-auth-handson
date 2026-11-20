// 画面から Cognito（Floci）の API を 1 つ呼ぶ。
// サインアップやログインの API は、AWS の認証情報なしで、クライアント ID だけで呼べる
const { clientId } = await (await fetch('/config')).json();

export async function cognito(action, params) {
  const response = await fetch('http://localhost:4566', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-amz-json-1.1',
      'x-amz-target': `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify({ ClientId: clientId, ...params }),
  });
  const json = await response.json();
  // 失敗すると {"__type":"UsernameExistsException","message":"..."} の形で返る
  if (!response.ok) throw new Error(`${json.__type}: ${json.message}`);
  return json;
}
