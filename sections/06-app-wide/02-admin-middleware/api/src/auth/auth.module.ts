import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { TokenVerifier } from './token-verifier.js';

@Module({
  controllers: [AuthController],
  providers: [
    TokenVerifier,
    // AuthGuard をアプリ全体に掛ける。@Public() の付いたものだけがトークン無しで呼べる
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  // /admin の middleware でも使うので、ほかのモジュールに公開する
  exports: [TokenVerifier],
})
export class AuthModule {}
