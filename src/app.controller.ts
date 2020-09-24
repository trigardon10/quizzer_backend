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
import { Entry } from './Entities/Entry';

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

  @Post('entry')
  async addEntry(@Body() params): Promise<Entry> {
    return this.appService.addEntry(
      params.question,
      params.hint,
      params.answer,
      1 // TODO UserId
    );
  }

  @Post('entry/:id')
  async editEntry(@Param('id', ParseIntPipe) id: number, @Body() params): Promise<Entry> {
    return this.appService.editEntry(
      id,
      params.question,
      params.hint,
      params.answer
    );
  }

  @Delete('entry/:id')
  async deleteEntry(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.appService.deleteEntry(id);
  }
}
