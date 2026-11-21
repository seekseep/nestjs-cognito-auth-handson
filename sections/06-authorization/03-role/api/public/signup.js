import { cognito } from './lib/cognito.js';

const message = document.querySelector('#message');
let email;

// 1. メールアドレスとパスワードで登録する。Cognito がメールで確認コードを送る
document.querySelector('#sign-up').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  email = form.get('email');
  try {
    await cognito('SignUp', {
      Username: email,
      Password: form.get('password'),
      UserAttributes: [{ Name: 'email', Value: email }],
    });
    document.querySelector('#confirm').hidden = false;
    message.textContent = '確認コードを送りました';
  } catch (error) {
    message.textContent = error.message;
  }
});

// 2. 届いた確認コードを送って、登録を確定する
document.querySelector('#confirm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  try {
    await cognito('ConfirmSignUp', { Username: email, ConfirmationCode: form.get('code') });
    message.textContent = 'サインアップできました';
  } catch (error) {
    message.textContent = error.message;
  }
});
