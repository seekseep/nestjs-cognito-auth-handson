import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { verifyToken } from '../auth/verify-token.js';
import { openDatabase } from '../database.js';

type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  // 作った人。認証を足すまでは null
  ownerId: string | null;
};

@Controller('notes')
export class NotesController {
  private readonly db = openDatabase();

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() input: { title: string; body?: string },
  ): Promise<Note> {
    // 正しいアクセストークンが無ければ、ここで 401 になる
    await verifyToken(authorization);
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      title: input.title,
      body: input.body ?? '',
      createdAt: now,
      updatedAt: now,
      ownerId: null,
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
  remove(@Param('id') id: string): void {
    const result = this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    if (result.changes === 0) {
      throw new NotFoundException(`Note ${id} not found`);
    }
  }
}
