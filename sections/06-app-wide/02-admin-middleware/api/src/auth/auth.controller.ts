import { Controller, Get } from '@nestjs/common';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  /**
   * 画面がサインインに使う、Cognito の API の入口とクライアント ID を返す。
   * どちらもブラウザに渡る値で、秘密ではない。
   */
  @Public() // サインインする前に読むので、トークン無しで呼べるようにする
  @Get('config')
  getConfig() {
    return {
      endpoint: process.env.COGNITO_ENDPOINT,
      clientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
    };
  }
}
