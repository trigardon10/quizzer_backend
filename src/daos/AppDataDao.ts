import { USERROLE } from 'src/Entities/User';

export interface AppDataDao {
  users: Record<number, UserDao>;
  token: string;
  currentUser: number;
}

export interface UserDao {
  id: number;
  name: string;
  role: USERROLE;
}
