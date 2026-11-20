import { Injectable } from '@nestjs/common';
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
}
