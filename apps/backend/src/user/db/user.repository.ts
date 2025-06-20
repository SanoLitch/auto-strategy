import { Injectable } from '@nestjs/common';
import { Prisma, User as UserDb } from '@prisma/client';

import { DbService } from '../../db';

/**
 * Репозиторий для работы с пользователями в базе данных.
 * TODO: Реализовать методы доступа к данным.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly db: DbService) { }

  public async create(data: Prisma.UserCreateInput): Promise<UserDb> {
    return this.db.user.create({ data });
  }

  public async findByEmail(email: string): Promise<UserDb> {
    return this.db.user.findUniqueOrThrow({ where: { email } });
  }

  public async findById(id: string): Promise<UserDb> {
    return this.db.user.findUniqueOrThrow({ where: { id } });
  }
}
