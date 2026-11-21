import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  // 作った人（アクセストークンの sub）。認証を足す前に作ったノートは null
  ownerId: string | null;
};

@Injectable()
export class NotesService {
  constructor(private readonly db: DatabaseSync) {}

  create(input: { title: string; body?: string }, ownerId: string): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      title: input.title,
      body: input.body ?? '',
      createdAt: now,
      updatedAt: now,
      ownerId,
    };
    this.db
      .prepare(
        'INSERT INTO notes (id, title, body, createdAt, updatedAt, ownerId) VALUES (:id, :title, :body, :createdAt, :updatedAt, :ownerId)',
      )
      .run(note);
    return note;
  }

  findAll(): Note[] {
    return this.db
      .prepare('SELECT * FROM notes ORDER BY createdAt')
      .all() as Note[];
  }

  remove(id: string, userId: string): void {
    const note = this.db
      .prepare('SELECT ownerId FROM notes WHERE id = ?')
      .get(id) as Pick<Note, 'ownerId'> | undefined;
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    // 作った人でなければ 403
    if (note.ownerId !== userId) {
      throw new ForbiddenException();
    }
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }
}
