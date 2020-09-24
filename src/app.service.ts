import { Injectable } from '@nestjs/common';
import { User, USERROLE } from './Entities/User';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { createHash } from 'crypto';
import { AppDataDao, EntryDao, UserDao } from './daos/AppDataDao';
import { JwtService } from '@nestjs/jwt';
import { Category } from './Entities/Category';
import { Entry } from './Entities/Entry';
import { Result } from './Entities/Result';

@Injectable()
export class AppService {
  constructor(private jwtService: JwtService) {}

  @Transaction()
  async login(
    name: string,
    password: string,
    @TransactionRepository(User) userRepo?: Repository<User>,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
    @TransactionRepository(Category) categoryRepo?: Repository<Category>,
    @TransactionRepository(Result) resultRepo?: Repository<Result>,
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

    const entries: Entry[] = await entryRepo.find();
    const results: Result[] = await resultRepo.find({where: {userId: user.id}})

    const entryDaos: Record<number, EntryDao> = {};

    entries.forEach(entry => entryDaos[entry.id] = entry);
    results.forEach(result => entryDaos[result.entryId] ? entryDaos[result.entryId].result = result : null)

    const categories: Record<number, Category> = await categoryRepo.find().then(cats => {
      const map: Record<number, Category> = {};
      cats.forEach(cat => map[cat.id] = cat);
      return map;
    })

    return { users, token, currentUser: user.id, entries: entryDaos, categories };
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

  // TODO: Rolle des Senders überprüfen
  @Transaction()
  async deleteUser(
    id: number,
    @TransactionRepository(User) userRepo?: Repository<User>,
  ): Promise<void> {
    const user = await userRepo.findOneOrFail({
      where: {
        id,
      },
    });

    await userRepo.remove(user);
  }

  // TODO: Rolle des Senders überprüfen
  @Transaction()
  async addEntry(
    question: string,
    hint: string,
    answer: string,
    userId: number,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
  ): Promise<Entry> {
    const entry: Entry = new Entry(userId, question, hint, answer);
    return entryRepo.save(entry);
  }

  // TODO: Rolle des Senders und creatorid überprüfen
  @Transaction()
  async editEntry(
    id: number,
    question: string,
    hint: string,
    answer: string,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
  ): Promise<Entry> {
    const entry = await entryRepo.findOneOrFail(id);
    entry.question = question;
    entry.hint = hint;
    entry.answer = answer;
    return entryRepo.save(entry);
  }

  // TODO: Rolle des Senders überprüfen
  @Transaction()
  async deleteEntry(
    id: number,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
  ): Promise<void> {
    const entry = await entryRepo.findOneOrFail({
      where: {
        id,
      },
    });

    await entryRepo.remove(entry);
  }
}
