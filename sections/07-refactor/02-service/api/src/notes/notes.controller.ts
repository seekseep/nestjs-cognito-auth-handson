import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { verifyToken } from '../auth/verify-token.js';
import { type Note, NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() input: { title: string; body?: string },
  ): Promise<Note> {
    // 正しいアクセストークンが無ければ、ここで 401 になる。あれば、トークンの中身が返る
    const user = await verifyToken(authorization);
    return this.notesService.create(input, user.sub);
  }

  @Get()
  findAll(): Note[] {
    return this.notesService.findAll();
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await verifyToken(authorization);
    this.notesService.remove(id, user.sub);
  }
}
