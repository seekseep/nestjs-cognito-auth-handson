import { Body, Controller, Post } from '@nestjs/common';
import { NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // POST /notes … ノートを作る
  @Post()
  create(@Body() body: { text: string }) {
    return this.notesService.create(body.text);
  }
}
