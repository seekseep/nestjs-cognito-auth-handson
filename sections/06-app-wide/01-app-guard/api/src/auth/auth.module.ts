import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';

@Module({
  controllers: [AuthController],
  providers: [
    // AuthGuard をアプリ全体に掛ける。@Public() の付いたものだけがトークン無しで呼べる
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
