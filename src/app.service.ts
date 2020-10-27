import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const results: Result[] = await resultRepo.find({
      where: { userId: user.id },
    });

    const entryDaos: Record<number, EntryDao> = {};

    entries.forEach(entry => (entryDaos[entry.id] = entry));
    results.forEach(result =>
      entryDaos[result.entryId]
        ? (entryDaos[result.entryId].result = result.value)
        : null,
    );

    const categories: Record<number, Category> = await categoryRepo
      .find()
      .then(cats => {
        const map: Record<number, Category> = {};
        cats.forEach(cat => (map[cat.id] = cat));
        return map;
      });

    return {
      users,
      token,
      currentUser: user.id,
      entries: entryDaos,
      categories,
    };
  }

  @Transaction()
  async addUser(
    initiator: User,
    name: string,
    password: string,
    role: USERROLE,
    @TransactionRepository(User) userRepo?: Repository<User>,
  ): Promise<UserDao> {
    if (initiator.role !== USERROLE.ADMIN) {
      throw new UnauthorizedException();
    }

    const hashedpw: Buffer = createHash('sha256')
      .update(password)
      .digest();
    const user = await userRepo.save(new User(name, hashedpw, role));
    return { id: user.id, name: user.name, role: user.role };
  }

  @Transaction()
  async deleteUser(
    initiator: User,
    id: number,
    @TransactionRepository(User) userRepo?: Repository<User>,
  ): Promise<void> {
    if (initiator.role !== USERROLE.ADMIN) {
      throw new UnauthorizedException();
    }

    const user = await userRepo.findOneOrFail({
      where: {
        id,
      },
    });

    await userRepo.remove(user);
  }

  @Transaction()
  async addEntry(
    initiator: User,
    question: string,
    hint: string,
    answer: string,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
  ): Promise<Entry> {
    const entry: Entry = new Entry(initiator.id, question, hint, answer);
    return entryRepo.save(entry);
  }

  @Transaction()
  async editEntry(
    initiator: User,
    id: number,
    question: string,
    hint: string,
    answer: string,
    categoryId: number,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
  ): Promise<Entry> {
    const entry = await entryRepo.findOneOrFail(id);

    if (entry.creatorId !== initiator.id) {
      throw new UnauthorizedException();
    }

    entry.question = question;
    entry.hint = hint;
    entry.answer = answer;
    entry.categoryId = categoryId;
    return entryRepo.save(entry);
  }

  @Transaction()
  async deleteEntry(
    initiator: User,
    id: number,
    @TransactionRepository(Entry) entryRepo?: Repository<Entry>,
  ): Promise<void> {
    const entry = await entryRepo.findOneOrFail({
      where: {
        id,
      },
    });

    if (entry.creatorId !== initiator.id) {
      throw new UnauthorizedException();
    }

    await entryRepo.remove(entry);
  }

  @Transaction()
  async addCategory(
    initiator: User,
    name: string,
    @TransactionRepository(Category) categoryRepo?: Repository<Category>,
  ): Promise<Category> {
    const cat: Category = new Category(name);
    return categoryRepo.save(cat);
  }

  @Transaction()
  async editCategory(
    initiator: User,
    id: number,
    name: string,
    @TransactionRepository(Category) categoryRepo?: Repository<Category>,
  ): Promise<Category> {
    const cat = await categoryRepo.findOneOrFail(id);

    cat.name = name;
    return categoryRepo.save(cat);
  }

  @Transaction()
  async deleteCategory(
    initiator: User,
    id: number,
    @TransactionRepository(Category) categoryRepo?: Repository<Category>,
  ): Promise<void> {
    const cat = await categoryRepo.findOneOrFail({
      where: {
        id,
      },
    });

    await categoryRepo.remove(cat);
  }

  @Transaction()
  async addResults(
    initiator: User,
    results: Record<number, number>,
    @TransactionRepository(Result) resultRepo?: Repository<Result>,
  ): Promise<Result[]> {
    const resArray: Result[] = Object.keys(results).map(
      entryIdStr =>
        new Result(initiator.id, parseInt(entryIdStr), results[entryIdStr]),
    );
    return resultRepo.save(resArray);
  }
}
