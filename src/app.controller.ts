import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { appRequest } from './app.middleware';
import { AppService } from './app.service';
import { AppDataDao, UserDao } from './daos/AppDataDao';
import { Category } from './Entities/Category';
import { Entry } from './Entities/Entry';
import { Result } from './Entities/Result';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  async login(@Body() params): Promise<AppDataDao> {
    return this.appService.login(params.username, params.password);
  }

  @Post('user')
  async addUser(@Body() params, @Req() request: appRequest): Promise<UserDao> {
    return this.appService.addUser(
      request.user,
      params.username,
      params.password,
      params.role,
    );
  }

  @Delete('user/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: appRequest,
  ): Promise<void> {
    await this.appService.deleteUser(request.user, id);
  }

  @Post('entry')
  async addEntry(@Body() params, @Req() request: appRequest): Promise<Entry> {
    return this.appService.addEntry(
      request.user,
      params.question,
      params.hint,
      params.answer,
    );
  }

  @Post('entry/:id')
  async editEntry(
    @Param('id', ParseIntPipe) id: number,
    @Body() params,
    @Req() request: appRequest,
  ): Promise<Entry> {
    return this.appService.editEntry(
      request.user,
      id,
      params.question,
      params.hint,
      params.answer,
      params.categoryId,
    );
  }

  @Delete('entry/:id')
  async deleteEntry(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: appRequest,
  ): Promise<void> {
    await this.appService.deleteEntry(request.user, id);
  }

  @Post('category')
  async addCategory(
    @Body() params,
    @Req() request: appRequest,
  ): Promise<Category> {
    return this.appService.addCategory(request.user, params.name);
  }

  @Post('category/:id')
  async editCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() params,
    @Req() request: appRequest,
  ): Promise<Category> {
    return this.appService.editCategory(request.user, id, params.name);
  }

  @Delete('category/:id')
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: appRequest,
  ): Promise<void> {
    await this.appService.deleteCategory(request.user, id);
  }

  @Post('results')
  async addResults(
    @Body() results,
    @Req() request: appRequest,
  ): Promise<Result[]> {
    return this.appService.addResults(request.user, results);
  }
}
