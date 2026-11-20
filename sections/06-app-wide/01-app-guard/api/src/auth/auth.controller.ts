import { Controller, Get } from '@nestjs/common';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  /**
   * 画面がサインインに使う、ユーザープール ID とクライアント ID を返す。
   * どちらもブラウザに渡る値で、秘密ではない。
   */
  @Public() // サインインする前に読むので、トークン無しで呼べるようにする
  @Get('config')
  getConfig() {
    return {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
    };
  }
}
