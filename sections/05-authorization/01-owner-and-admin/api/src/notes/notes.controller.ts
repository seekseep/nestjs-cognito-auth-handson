import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../auth/user.js';
import { createNoteSchema, type CreateNoteDto } from './dto/create-note.dto.js';
import { updateNoteSchema, type UpdateNoteDto } from './dto/update-note.dto.js';
import type { Note } from './entities/note.entity.js';
import { NotesService } from './notes.service.js';

// コントローラーに Guard を掛けると、すべてのメソッドでトークンが必要になる
@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@CurrentUser() user: User): Note[] {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Note {
    return this.notesService.findOne(id, user);
  }

  @Post()
  create(
    @Body({ schema: createNoteSchema }) dto: CreateNoteDto,
    @CurrentUser() user: User,
  ): Note {
    return this.notesService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateNoteSchema }) dto: UpdateNoteDto,
    @CurrentUser() user: User,
  ): Note {
    return this.notesService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): void {
    this.notesService.remove(id, user);
  }
}
