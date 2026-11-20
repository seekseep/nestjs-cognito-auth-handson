import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 画面に、Cognito のクライアント ID を渡す（ブラウザに渡る値で、秘密ではない）
  @Get('config')
  getConfig() {
    return { clientId: process.env.COGNITO_CLIENT_ID };
  }
}
