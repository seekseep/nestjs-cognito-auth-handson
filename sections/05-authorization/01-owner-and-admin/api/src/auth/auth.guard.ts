import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtVerifier } from 'aws-jwt-verify';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import type { Request } from 'express';

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
 */
@Injectable()
export class AuthGuard implements CanActivate {
  // 発行元（iss）。Floci なら http://localhost:4566/<プール ID>、
  // 本物の Cognito なら https://cognito-idp.<リージョン>.amazonaws.com/<プール ID>
  private readonly issuer = `${requireEnv('COGNITO_ENDPOINT')}/${requireEnv('COGNITO_USER_POOL_ID')}`;
  private readonly clientId = requireEnv('COGNITO_USER_POOL_CLIENT_ID');

  private readonly verifier = JwtVerifier.create(
    {
      issuer: this.issuer,
      // 署名を確かめる公開鍵（JWKS）の場所
      jwksUri: `${this.issuer}/.well-known/jwks.json`,
      // Cognito のアクセストークンには aud が無いので、代わりに token_use と client_id を確かめる
      audience: null,
      customJwtCheck: ({ payload }) => {
        if (payload.token_use !== 'access') {
          throw new Error('Not an access token');
        }
        if (payload.client_id !== this.clientId) {
          throw new Error('Wrong client');
        }
      },
    },
    {
      // aws-jwt-verify は https でしか JWKS を取りに行かないので、http の Floci にも届く fetch で取る
      jwksCache: new SimpleJwksCache({
        fetcher: { fetch: async (uri) => (await fetch(uri)).arrayBuffer() },
      }),
    },
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      // 署名・発行元（ユーザープール）・有効期限・token_use・client_id を確かめる
      request.user = (await this.verifier.verify(
        token,
      )) as CognitoAccessTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
