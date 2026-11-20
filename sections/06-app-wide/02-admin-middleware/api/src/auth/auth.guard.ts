import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import { TokenVerifier } from './token-verifier.js';
import type { User } from './user.js';

/** Guard を通ったリクエスト。user に検証済みのトークンの中身が入る。 */
export type AuthenticatedRequest = Request & { user: User };

/**
 * Authorization: Bearer <アクセストークン> を検証する Guard。
 * 正しいトークンなら request.user に中身を入れて通し、そうでなければ 401 を返す。
 * @Public() の付いたメソッド・コントローラーは、確かめずに通す。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenVerifier: TokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // メソッドかコントローラーに @Public() が付いていれば通す
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // middleware（/admin）がもう検証していれば、もう一度は確かめない
    if (request.user) return true;

    request.user = await this.tokenVerifier.verify(
      request.headers.authorization,
    );
    return true;
  }
}
