import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { NotesModule } from './notes/notes.module.js';

@Module({
  imports: [AuthModule, NotesModule, AdminModule],
})
export class AppModule {}
