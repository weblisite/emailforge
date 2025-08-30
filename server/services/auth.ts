import bcrypt from 'bcrypt';
import { storage } from '../storage';
import type { InsertUser, User } from '@shared/schema';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(userData: InsertUser): Promise<User> {
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await this.hashPassword(userData.password);
    return storage.createUser({
      ...userData,
      password: hashedPassword,
    });
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }
}

export const authService = new AuthService();
