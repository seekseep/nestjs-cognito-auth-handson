import { UnauthorizedException } from '@nestjs/common';
import { JwtVerifier } from 'aws-jwt-verify';
import { SimpleJwksCache } from 'aws-jwt-verify/jwk';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';

// トークンの発行元（iss）。Floci の中の、自分のユーザープール
const issuer = `http://floci:4566/${process.env.COGNITO_USER_POOL_ID}`;

const verifier = JwtVerifier.create(
  {
    issuer,
    // 署名を確かめる公開鍵（JWKS）の場所
    jwksUri: `${issuer}/.well-known/jwks.json`,
    // Cognito のアクセストークンには aud が無いので、代わりに token_use と client_id を確かめる
    audience: null,
    customJwtCheck: ({ payload }) => {
      if (payload.token_use !== 'access') {
        throw new Error('Not an access token');
      }
      if (payload.client_id !== process.env.COGNITO_CLIENT_ID) {
        throw new Error('Wrong client');
      }
    },
  },
  {
    // aws-jwt-verify は https でしか JWKS を取りに行かないので、http の Floci から fetch で取る
    jwksCache: new SimpleJwksCache({
      fetcher: { fetch: async (uri) => (await fetch(uri)).arrayBuffer() },
    }),
  },
);

/**
 * Authorization ヘッダー（Bearer <アクセストークン>）を確かめ、正しければトークンの中身を返す。
 * トークンが無い・正しくないときは 401 にする。
 */
export async function verifyToken(
  authorization: string | undefined,
): Promise<CognitoAccessTokenPayload> {
  const [type, token] = authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedException('Missing bearer token');
  }
  try {
    // 署名・発行元・有効期限と、上の customJwtCheck を確かめる
    return (await verifier.verify(token)) as CognitoAccessTokenPayload;
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
}
