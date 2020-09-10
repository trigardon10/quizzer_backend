import { Injectable } from '@nestjs/common';
import { User, USERROLE } from './Entities/User';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { createHash } from 'crypto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // TODO: Rolle des Senders überprüfen
  @Transaction()
  addUser(
    name: string,
    password: string,
    role: USERROLE,
    @TransactionRepository(User) userRepo?: Repository<User>
  ): Promise<User> {
    const hashedpw: Buffer = createHash('sha256').update(password).digest();
    return userRepo.save(new User(name, hashedpw, role));
  }
}
