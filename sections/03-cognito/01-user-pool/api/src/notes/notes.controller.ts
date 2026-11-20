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
} from '@nestjs/common';
import { createNoteSchema, type CreateNoteDto } from './dto/create-note.dto.js';
import { updateNoteSchema, type UpdateNoteDto } from './dto/update-note.dto.js';
import type { Note } from './entities/note.entity.js';
import { NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(): Note[] {
    return this.notesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Note {
    return this.notesService.findOne(id);
  }

  @Post()
  create(@Body({ schema: createNoteSchema }) dto: CreateNoteDto): Note {
    return this.notesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body({ schema: updateNoteSchema }) dto: UpdateNoteDto,
  ): Note {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): void {
    this.notesService.remove(id);
  }
}
