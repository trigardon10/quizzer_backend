import { Injectable } from '@nestjs/common';
import { User, USERROLE } from './Entities/User';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { createHash } from 'crypto';
import { AppDataDao, UserDao } from './daos/AppDataDao';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(private jwtService: JwtService) {}

  @Transaction()
  async login(
    name: string,
    password: string,
    @TransactionRepository(User) userRepo?: Repository<User>,
  ): Promise<AppDataDao> {
    const user = await userRepo.findOneOrFail({
      where: {
        name,
        hashedpw: createHash('sha256')
          .update(password)
          .digest(),
      },
    });

    const users: Record<number, UserDao> = await userRepo.find().then(users => {
      const userMap: Record<number, UserDao> = {};
      users.forEach(
        user =>
          (userMap[user.id] = {
            id: user.id,
            name: user.name,
            role: user.role,
          }),
      );
      return userMap;
    });

    const token = this.jwtService.sign({ id: user.id });

    return { users, token, currentUser: user.id };
  }

  // TODO: Rolle des Senders überprüfen
  @Transaction()
  async addUser(
    name: string,
    password: string,
    role: USERROLE,
    @TransactionRepository(User) userRepo?: Repository<User>,
  ): Promise<UserDao> {
    const hashedpw: Buffer = createHash('sha256')
      .update(password)
      .digest();
    const user = await userRepo.save(new User(name, hashedpw, role));
    return { id: user.id, name: user.name, role: user.role };
  }
}
