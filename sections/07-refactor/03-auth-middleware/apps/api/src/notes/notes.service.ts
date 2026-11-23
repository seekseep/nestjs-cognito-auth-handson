import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
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
  // ノートを分け合うチーム。無ければ null
  teamId: string | null;
};

@Injectable()
export class NotesService {
  constructor(private readonly db: DatabaseSync) {}

  create(
    input: { title: string; body?: string; teamId?: string },
    ownerId: string,
  ): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      title: input.title,
      body: input.body ?? '',
      createdAt: now,
      updatedAt: now,
      ownerId,
      teamId: input.teamId ?? null,
    };
    this.db
      .prepare(
        'INSERT INTO notes (id, title, body, createdAt, updatedAt, ownerId, teamId) VALUES (:id, :title, :body, :createdAt, :updatedAt, :ownerId, :teamId)',
      )
      .run(note);
    return note;
  }

  findAll(): Note[] {
    return this.db
      .prepare('SELECT * FROM notes ORDER BY createdAt')
      .all() as Note[];
  }

  remove(id: string, user: CognitoAccessTokenPayload): void {
    const note = this.db
      .prepare('SELECT ownerId, teamId FROM notes WHERE id = ?')
      .get(id) as Pick<Note, 'ownerId' | 'teamId'> | undefined;
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    // admin グループの人は、だれのノートでも消せる
    const isAdmin = user['cognito:groups']?.includes('admin') ?? false;
    // ノートのチームに入っている人も消せる。所属は team_members の表で確かめる
    const isMember =
      note.teamId !== null &&
      this.db
        .prepare('SELECT 1 FROM team_members WHERE teamId = ? AND userId = ?')
        .get(note.teamId, user.sub) !== undefined;
    // 作った人でも、admin でも、同じチームの人でもなければ 403
    if (note.ownerId !== user.sub && !isAdmin && !isMember) {
      throw new ForbiddenException();
    }
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }
}
