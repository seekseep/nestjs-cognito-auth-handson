import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { NotesController } from './notes/notes.controller.js';
import { DatabaseModule } from './database/database.module.js';
import { NotesService } from './notes/notes.service.js';
import { TeamsController } from './teams/teams.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, NotesController, TeamsController],
  providers: [AppService, NotesService],
})
export class AppModule implements NestModule {
  // ノートの作成と削除にだけ、AuthMiddleware を掛ける（一覧は誰でも見られる）
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'notes', method: RequestMethod.POST },
        { path: 'notes/:id', method: RequestMethod.DELETE },
      );
  }
}
