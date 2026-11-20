import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isAdmin, type User } from '../auth/user.js';
import type { CreateNoteDto } from './dto/create-note.dto.js';
import type { UpdateNoteDto } from './dto/update-note.dto.js';
import type { Note } from './entities/note.entity.js';

@Injectable()
export class NotesService {
  // メモはメモリ上に持つ。API を再起動すると消える。
  private readonly notes: Note[] = [];

  /** admin なら全員のメモを、そうでなければ自分のメモだけを返す。 */
  findAll(user: User): Note[] {
    if (isAdmin(user)) return this.notes;
    return this.notes.filter((n) => n.ownerId === user.sub);
  }

  /** 持ち主か admin でなければ 403 にする。 */
  findOne(id: string, user: User): Note {
    const note = this.notes.find((n) => n.id === id);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    if (note.ownerId !== user.sub && !isAdmin(user)) {
      throw new ForbiddenException(`Note ${id} is not yours`);
    }
    return note;
  }

  create(dto: CreateNoteDto, user: User): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      // 持ち主は、本文からではなくトークン（呼び出した人）から決める
      ownerId: user.sub,
      title: dto.title,
      body: dto.body,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(note);
    return note;
  }

  update(id: string, dto: UpdateNoteDto, user: User): Note {
    const note = this.findOne(id, user);
    if (dto.title !== undefined) note.title = dto.title;
    if (dto.body !== undefined) note.body = dto.body;
    note.updatedAt = new Date().toISOString();
    return note;
  }

  remove(id: string, user: User): void {
    const note = this.findOne(id, user);
    this.notes.splice(this.notes.indexOf(note), 1);
  }
}
