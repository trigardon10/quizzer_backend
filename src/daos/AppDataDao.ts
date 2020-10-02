import { Category } from 'src/Entities/Category';
import { Result } from 'src/Entities/Result';
import { USERROLE } from 'src/Entities/User';

export interface AppDataDao {
  users: Record<number, UserDao>;
  token: string;
  currentUser: number;
  entries: Record<number, EntryDao>;
  categories: Record<number, Category>;
}

export interface UserDao {
  id: number;
  name: string;
  role: USERROLE;
}

export interface EntryDao {
  id: number;
  creatorId: number;
  categoryId: number;
  question: string;
  hint: string;
  answer: string;
  result?: number;
}
