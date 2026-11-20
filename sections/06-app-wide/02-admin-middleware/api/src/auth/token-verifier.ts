import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtVerifier } from 'aws-jwt-verify';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
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

  /** 正しいトークンならその中身を返し、そうでなければ 401 の例外を投げる。 */
  async verify(authorization: string | undefined): Promise<User> {
    const [type, token] = authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    try {
      // 署名・発行元（ユーザープール）・有効期限・token_use・client_id を確かめる
      return (await this.verifier.verify(token)) as User;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
