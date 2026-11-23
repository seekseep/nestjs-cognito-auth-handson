import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { verifyToken } from '../auth/verify-token.js';

type Note = {
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

@Controller('notes')
export class NotesController {
  constructor(private readonly db: DatabaseSync) {}

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() input: { title: string; body?: string; teamId?: string },
  ): Promise<Note> {
    // 正しいアクセストークンが無ければ、ここで 401 になる。あれば、トークンの中身が返る
    const user = await verifyToken(authorization);
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      title: input.title,
      body: input.body ?? '',
      createdAt: now,
      updatedAt: now,
      // 作った人は、アクセストークンの sub（ユーザーの ID）
      ownerId: user.sub,
      teamId: input.teamId ?? null,
    };
    this.db
      .prepare(
        'INSERT INTO notes (id, title, body, createdAt, updatedAt, ownerId, teamId) VALUES (:id, :title, :body, :createdAt, :updatedAt, :ownerId, :teamId)',
      )
      .run(note);
    return note;
  }

  @Get()
  findAll(): Note[] {
    return this.db
      .prepare('SELECT * FROM notes ORDER BY createdAt')
      .all() as Note[];
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await verifyToken(authorization);
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
