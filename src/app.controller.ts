import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AppDataDao, UserDao } from './daos/AppDataDao';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  async login(@Body() params): Promise<AppDataDao> {
    return this.appService.login(params.username, params.password);
  }

  @Post('user')
  async addUser(@Body() params): Promise<UserDao> {
    return this.appService.addUser(
      params.username,
      params.password,
      params.role,
    );
  }
}
