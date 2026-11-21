#!/usr/bin/env node
/**
 * 各節の先頭サムネイル（images/00-thumbnail.svg）を、同じ見た目で生成する。
 *
 *   node tools/thumbnail.mjs            … 下の THUMBNAILS をすべて書き出す
 *
 * 節を足したら THUMBNAILS に 1 行足して実行する。チップは「その節で触る道具」。
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 道具ごとの色。チップの左の丸に使う。
const TOOL_COLORS = {
  'Node.js': '#5FA04E',
  npm: '#CB3837',
  Podman: '#892CA0',
  compose: '#892CA0',
  'Next.js': '#111111',
  NestJS: '#E0234E',
  curl: '#0A6EBD',
  Postman: '#FF6C37',
  Cognito: '#DD344C',
  Amplify: '#FF9900',
  S3: '#3F8624',
  JWT: '#D63AFF',
  OpenAPI: '#6BA539',
  'VS Code': '#007ACC',
  TypeScript: '#3178C6',
  Middleware: '#475569',
  Guard: '#475569',
  Filter: '#475569',
  Logger: '#475569',
  Vitest: '#729B1B',
  supertest: '#475569',
  Playwright: '#2EAD33',
  HTML: '#E34F26',
  AWS: '#FF9900',
  SQLite: '#003B57',
  nginx: '#009639',
};

const THUMBNAILS = [
  ['01-setup/01-environment', '01', '準備', ['Node.js', 'Podman', 'VS Code']],
  ['02-hello-world/01-nestjs', '02', 'NestJS の Hello World', ['NestJS']],
  ['02-hello-world/02-podman', '02', 'Podman で動かす', ['Podman', 'nginx']],
  ['03-design/01-notes-api', '03', 'ノートの API を設計する', ['HTTP']],
  ['03-design/02-authentication', '03', '認証を設計する', ['Cognito', 'JWT']],
  ['03-design/03-authorization', '03', '認可を設計する', ['401', '403']],
  ['04-implementation/01-sqlite', '04', 'SQLite を用意する', ['SQLite', 'Podman']],
  ['04-implementation/02-create', '04', '作成を実装する', ['NestJS', 'POST']],
  ['04-implementation/03-list', '04', '一覧を実装する', ['NestJS', 'GET', 'HTML']],
  ['04-implementation/04-delete', '04', '削除を実装する', ['NestJS', 'DELETE']],
  ['05-authentication/01-sign-up', '05', 'サインアップ画面を作る', ['Cognito', 'Floci', 'HTML']],
  ['05-authentication/02-log-in', '05', 'ログイン画面を作る', ['Cognito', 'JWT', 'HTML']],
  ['05-authentication/03-require-token', '05', 'トークンが無いと作れないようにする', ['NestJS', 'JWT']],
  ['05-authentication/04-create-with-token', '05', 'トークンを付けて作る', ['JWT', 'curl']],
  ['06-authorization/01-kinds', '06', '認可の種類', ['RBAC', 'ReBAC']],
  ['06-authorization/02-ownership', '06', '所有で認可する', ['NestJS', 'JWT']],
  ['06-authorization/03-role', '06', '役割で認可する', ['Cognito', 'JWT']],
  ['06-authorization/04-membership', '06', '所属で認可する', ['SQLite', 'NestJS']],
  ['07-refactor/01-database-provider', '07', 'データベースをプロバイダーに分ける', ['NestJS', 'SQLite']],
  ['07-refactor/02-service', '07', '処理をサービスに分ける', ['NestJS']],
  ['07-refactor/03-auth-middleware', '07', '認証を middleware にする', ['NestJS', 'Middleware']],
];

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

// 全角は 1、半角は 0.55 として、だいたいの文字幅を見積もる（チップの幅を決めるため）。
function textWidth(s, size) {
  let w = 0;
  for (const ch of s) w += /[\u0000-ÿ]/.test(ch) ? 0.62 : 1;
  return w * size;
}

function render(chapter, title, tools) {
  const W = 960;
  const H = 400;
  const font = `'Hiragino Sans','Noto Sans JP','Yu Gothic UI',system-ui,sans-serif`;
  const titleSize = textWidth(title, 46) > W - 120 ? 38 : 46;
  let x = 64;
  const chips = tools
    .map((tool) => {
      const label = escapeXml(tool);
      const w = textWidth(tool, 22) + 76;
      const color = TOOL_COLORS[tool] ?? '#475569';
      const g = `<g transform="translate(${x} 270)"><rect width="${w}" height="52" rx="26" fill="#ffffff" stroke="#d6dde8" stroke-width="2"/><circle cx="28" cy="26" r="9" fill="${color}"/><text x="46" y="34" font-size="22" font-weight="600" fill="#1e293b" font-family="${font}">${label}</text></g>`;
      x += w + 16;
      return g;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(`${chapter} 章: ${title}`)}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef4ff"/><stop offset="1" stop-color="#fdf2f8"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="24" fill="url(#bg)"/>
<circle cx="860" cy="70" r="120" fill="#e0234e" opacity="0.07"/>
<circle cx="900" cy="330" r="90" fill="#111111" opacity="0.05"/>
<text x="64" y="104" font-size="24" font-weight="700" fill="#e0234e" font-family="${font}" letter-spacing="2">CHAPTER ${escapeXml(chapter)}</text>
<text x="64" y="186" font-size="${titleSize}" font-weight="800" fill="#0f172a" font-family="${font}">${escapeXml(title)}</text>
<rect x="64" y="216" width="96" height="6" rx="3" fill="#0f172a"/>
${chips}
</svg>
`;
}

let count = 0;
for (const [rel, chapter, title, tools] of THUMBNAILS) {
  // まだ作っていない節は飛ばす（節のディレクトリを先回りして作らない）。
  const lectureDir = path.join(ROOT, 'sections', ...rel.split('/'));
  if (!existsSync(lectureDir)) continue;
  const dir = path.join(lectureDir, 'images');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, '00-thumbnail.svg'), render(chapter, title, tools));
  count += 1;
}
console.log(`[thumbnail] wrote ${count} thumbnails`);
