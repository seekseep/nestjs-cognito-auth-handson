import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { type Note, NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // 正しいアクセストークンが無ければ、ここに届く前に AuthMiddleware が 401 にする
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() input: { title: string; body?: string; teamId?: string },
  ): Note {
    return this.notesService.create(input, req.user.sub);
  }

  @Get()
  findAll(): Note[] {
    return this.notesService.findAll();
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string): void {
    this.notesService.remove(id, req.user);
  }
}
