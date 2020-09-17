import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
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

  @Delete('user/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.appService.deleteUser(id);
  }
}
