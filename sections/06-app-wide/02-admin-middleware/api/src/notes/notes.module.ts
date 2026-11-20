import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';

@Module({
  controllers: [NotesController],
  providers: [NotesService],
  // /admin の API でも使うので、ほかのモジュールに公開する
  exports: [NotesService],
})
export class NotesModule {}
