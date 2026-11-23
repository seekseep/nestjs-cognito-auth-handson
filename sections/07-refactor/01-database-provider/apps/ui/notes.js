import { apiUrl } from './lib/api.js';

// GET /notes を呼んで、ノートを並べる（トークンは要らない）
const notes = await (await fetch(`${apiUrl}/notes`)).json();
const list = document.querySelector('#notes');
for (const note of notes) {
  const item = document.createElement('li');
  // textContent で入れる（innerHTML だと、ノートに書いた HTML が動いてしまう）
  item.textContent = `${note.title}: ${note.body}`;
  list.append(item);
}
if (notes.length === 0) list.textContent = 'ノートはまだありません';
