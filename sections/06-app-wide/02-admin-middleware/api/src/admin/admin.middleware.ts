import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { TokenVerifier } from '../auth/token-verifier.js';
import { isAdmin } from '../auth/user.js';

/**
 * /admin の下を admin グループの人だけにする middleware。
 * middleware は Guard より先に動くので、ここでトークンを検証して request.user に入れる。
 */
@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(private readonly tokenVerifier: TokenVerifier) {}

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const user = await this.tokenVerifier.verify(req.headers.authorization);
    if (!isAdmin(user)) {
      throw new ForbiddenException('Admin only');
    }
    req.user = user;
    next();
  }
}
