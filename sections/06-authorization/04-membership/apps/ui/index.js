import { apiUrl } from './lib/api.js';

// API の GET / を呼んで、返ってきた文字を出す
const response = await fetch(`${apiUrl}/`);
document.querySelector('#message').textContent = await response.text();
