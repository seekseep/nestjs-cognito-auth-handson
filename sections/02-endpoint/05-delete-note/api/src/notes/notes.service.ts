import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface Note {
  id: string;
  text: string;
}

@Injectable()
export class NotesService {
  // ノートはメモリ上の配列に持つ（API を起動し直すと消える）
  private readonly notes: Note[] = [];

  create(text: string): Note {
    const note = { id: randomUUID(), text };
    this.notes.push(note);
    return note;
  }

  findAll(): Note[] {
    return this.notes;
  }

  remove(id: string): void {
    const index = this.notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFoundException();
    }
    this.notes.splice(index, 1);
  }
}
