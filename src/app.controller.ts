import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('user')
  async addUser(@Body() params): Promise<void> {
    await this.appService.addUser(params.username, params.password, params.role);
  }
}
