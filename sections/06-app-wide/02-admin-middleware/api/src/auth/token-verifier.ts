import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { User } from './user.js';

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
 * Authorization ヘッダーのアクセストークンを検証する。
 * AuthGuard と、/admin の middleware の両方から使うので、Guard から切り出した。
 */
@Injectable()
export class TokenVerifier {
  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: requireEnv('COGNITO_USER_POOL_ID'),
    tokenUse: 'access',
    clientId: requireEnv('COGNITO_USER_POOL_CLIENT_ID'),
  });

  /** 正しいトークンならその中身を返し、そうでなければ 401 の例外を投げる。 */
  async verify(authorization: string | undefined): Promise<User> {
    const [type, token] = authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    try {
      // 署名・発行元（ユーザープール）・有効期限・token_use・client_id を確かめる
      return await this.verifier.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
