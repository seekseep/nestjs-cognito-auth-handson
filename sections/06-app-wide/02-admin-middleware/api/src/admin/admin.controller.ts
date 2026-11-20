import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../auth/user.js';
import type { Note } from '../notes/entities/note.entity.js';
import { NotesService } from '../notes/notes.service.js';

/** 管理用の API。/admin の下は AdminMiddleware が admin だけに絞っている。 */
@Controller('admin')
export class AdminController {
  constructor(private readonly notesService: NotesService) {}

  @Get('notes')
  findAllNotes(@CurrentUser() user: User): Note[] {
    // admin なので、全員のメモが返る
    return this.notesService.findAll(user);
  }
}
