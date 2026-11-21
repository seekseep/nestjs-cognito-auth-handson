import { Injectable, NestMiddleware } from '@nestjs/common';
import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from './verify-token.js';

/** 認証を通ったリクエスト。user にアクセストークンの中身が入る。 */
export type AuthenticatedRequest = Request & {
  user: CognitoAccessTokenPayload;
};

/**
 * アクセストークンを確かめる middleware。正しければ req.user に中身を入れて先に進め、
 * 正しくなければ 401 にする。
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    req.user = await verifyToken(req.headers.authorization);
    next();
  }
}
