import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { User } from './Entities/User';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  constructor(@InjectRepository(User) private userRepo: Repository<User>, private jwtService: JwtService) {}
  
  async use(req: appRequest, res: Response, next: Function) {
    const id: number = this.jwtService.verify(req.headers.authorization).id;
    const user = await this.userRepo.findOneOrFail(id);
    req.user = user;
    console.log('Incoming Request from', user.name)
    next();
  }
}

export interface appRequest extends Request {
    user: User;
}
