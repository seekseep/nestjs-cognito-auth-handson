import { Body, Controller, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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
  create(@Body() input: { title: string; body?: string }): Note {
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
}
