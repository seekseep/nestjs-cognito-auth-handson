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
    const user = await verifyToken(authorization);
    return this.notesService.create(body.text, user.sub);
  }

  // GET /notes … ノートの一覧
  @Get()
  findAll() {
    return this.notesService.findAll();
  }

  // DELETE /notes/:id … ノートを消す。成功したら 204（本文なし）。作った人でなければ 403
  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ) {
    const user = await verifyToken(authorization);
    this.notesService.remove(id, user.sub);
  }
}
