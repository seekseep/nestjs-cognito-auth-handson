import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NotesController } from './notes/notes.controller.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, NotesController],
  providers: [AppService],
})
export class AppModule {}
