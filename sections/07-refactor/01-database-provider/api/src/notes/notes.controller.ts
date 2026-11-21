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
};

@Controller('notes')
export class NotesController {
  constructor(private readonly db: DatabaseSync) {}

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() input: { title: string; body?: string },
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
    };
    this.db
      .prepare(
        'INSERT INTO notes (id, title, body, createdAt, updatedAt, ownerId) VALUES (:id, :title, :body, :createdAt, :updatedAt, :ownerId)',
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
      .prepare('SELECT ownerId FROM notes WHERE id = ?')
      .get(id) as Pick<Note, 'ownerId'> | undefined;
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    // 作った人でなければ 403
    if (note.ownerId !== user.sub) {
      throw new ForbiddenException();
    }
    this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }
}
