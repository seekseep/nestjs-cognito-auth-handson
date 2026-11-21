import { cognito } from './lib/cognito.js';

const message = document.querySelector('#message');

// メールアドレスとパスワードを Cognito に送り、トークンを受け取る
document.querySelector('#log-in').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    const result = await cognito('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: form.get('email'), PASSWORD: form.get('password') },
    });
    // API を呼ぶときに付けるのは、アクセストークン
    document.querySelector('#token').textContent = result.AuthenticationResult.AccessToken;
    message.textContent = 'ログインできました';
  } catch (error) {
    message.textContent = error.message;
  }
});
