import { DatabaseSync } from 'node:sqlite';

/** データベース（DB_PATH のファイル）を開き、テーブルが無ければ作る。 */
export function openDatabase(): DatabaseSync {
  const db = new DatabaseSync(process.env.DB_PATH ?? 'notes.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      ownerId TEXT,
      teamId TEXT
    ) STRICT;
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY
    ) STRICT;
    CREATE TABLE IF NOT EXISTS team_members (
      teamId TEXT NOT NULL REFERENCES teams (id),
      userId TEXT NOT NULL,
      PRIMARY KEY (teamId, userId)
    ) STRICT;
  `);
  return db;
}
