import { db } from './init';

export interface User {
  email: string;
  role: 'admin' | 'student';
  name?: string;
  password?: string;
}

export const usersDb = {
  create: (user: User) => {
    db.runSync(
      'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
      [user.email, user.password || '', user.role, user.name || null]
    );
  },

  getByEmail: (email: string): User | null => {
    return db.getFirstSync('SELECT * FROM users WHERE email = ?', [email]);
  },

  exists: (email: string): boolean => {
    const result = db.getFirstSync('SELECT email FROM users WHERE email = ?', [email]);
    return !!result;
  }
};
