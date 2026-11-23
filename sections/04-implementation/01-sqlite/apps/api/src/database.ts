import { DatabaseSync } from 'node:sqlite';

/** データベース（DB_PATH のファイル）を開き、notes テーブルが無ければ作る。 */
export function openDatabase(): DatabaseSync {
  const db = new DatabaseSync(process.env.DB_PATH ?? 'notes.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      ownerId TEXT
    ) STRICT
  `);
  return db;
}
