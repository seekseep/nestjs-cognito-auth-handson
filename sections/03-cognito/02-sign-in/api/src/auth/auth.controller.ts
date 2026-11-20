import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  /**
   * 画面がサインインに使う、ユーザープール ID とクライアント ID を返す。
   * どちらもブラウザに渡る値で、秘密ではない。
   */
  @Get('config')
  getConfig() {
    return {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
    };
  }
}
