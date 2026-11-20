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
import { NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // POST /notes … ノートを作る。正しいアクセストークンが無ければ 401
  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { text: string },
  ) {
    await verifyToken(authorization);
    return this.notesService.create(body.text);
  }

  // GET /notes … ノートの一覧
  @Get()
  findAll() {
    return this.notesService.findAll();
  }

  // DELETE /notes/:id … ノートを消す。成功したら 204（本文なし）
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    this.notesService.remove(id);
  }
}
