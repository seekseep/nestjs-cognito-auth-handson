import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { NotesModule } from '../notes/notes.module.js';
import { AdminController } from './admin.controller.js';
import { AdminMiddleware } from './admin.middleware.js';

@Module({
  imports: [AuthModule, NotesModule],
  controllers: [AdminController],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // /admin と、その下のすべてのパスに掛ける
    consumer
      .apply(AdminMiddleware)
      .forRoutes({ path: 'admin{/*splat}', method: RequestMethod.ALL });
  }
}
