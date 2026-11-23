// apps/api/scripts/setup-cognito.js が書き出す config.json を読む。どのユーザープールに、どのクライアントとしてログインするか（作り直したときに古い値を使わないよう、キャッシュしない）
const response = await fetch('/config.json', { cache: 'no-store' });
if (!response.ok) {
  document.body.insertAdjacentHTML('afterbegin', '<p class="error">config.json がありません。<code>node apps/api/scripts/setup-cognito.js</code> を実行してから、読み込み直してください</p>');
  throw new Error('config.json がありません');
}
export const config = await response.json();

// Cognito の API の入口は、issuer のオリジン（Floci は http://localhost:4566、本物は https://cognito-idp.<リージョン>.amazonaws.com）
export const cognitoEndpoint = new URL(config.issuer).origin;
