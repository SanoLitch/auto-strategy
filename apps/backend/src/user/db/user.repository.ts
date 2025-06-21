import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import {
  Prisma, User as UserDb,
} from '@prisma/client';
import { DbService } from '../../core';

@Injectable()
export class UserRepository {
  constructor(private readonly db: DbService) { }

  public async create(data: Prisma.UserCreateInput): Promise<UserDb> {
    try {
      return await this.db.user.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('User with this email already exists.');
      }
      throw error;
    }
  }

  public async existsByEmail(email: string): Promise<boolean> {
    const count = await this.db.user.count({ where: { email } });

    return count > 0;
  }

  public async findByEmail(email: string): Promise<UserDb> {
    const user = await this.db.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${ email } not found.`);
    }
    return user;
  }

  public async findById(id: string): Promise<UserDb> {
    return this.db.user.findUniqueOrThrow({ where: { id } });
  }
}
