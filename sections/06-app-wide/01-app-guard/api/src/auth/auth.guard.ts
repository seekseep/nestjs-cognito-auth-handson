import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator.js';

/** Guard を通ったリクエスト。user に検証済みのトークンの中身が入る。 */
export type AuthenticatedRequest = Request & {
  user: CognitoAccessTokenPayload;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `環境変数 ${name} がありません。api/.env を確かめてください`,
    );
  }
  return value;
}

/**
 * Authorization: Bearer <アクセストークン> を検証する Guard。
 * 正しいトークンなら request.user に中身を入れて通し、そうでなければ 401 を返す。
 * @Public() の付いたメソッド・コントローラーは、確かめずに通す。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: requireEnv('COGNITO_USER_POOL_ID'),
    tokenUse: 'access',
    clientId: requireEnv('COGNITO_USER_POOL_CLIENT_ID'),
  });

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // メソッドかコントローラーに @Public() が付いていれば通す
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      // 署名・発行元（ユーザープール）・有効期限・token_use・client_id を確かめる
      request.user = await this.verifier.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
