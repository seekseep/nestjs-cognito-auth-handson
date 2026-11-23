import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NotesController } from './notes/notes.controller.js';

@Module({
  imports: [],
  controllers: [AppController, NotesController],
  providers: [AppService],
})
export class AppModule {}
