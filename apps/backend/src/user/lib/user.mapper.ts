import {
  User as UserDb, Prisma,
} from '@prisma/client';
import {
  Uuid, PasswordHash,
} from '@libs/domain-primitives';
import { User as UserDomain } from '../domain/user.entity';
import { UserDto } from '../api/user.dto';

export class UserMapper {
  public static toEntity(userPrisma: UserDb): UserDomain {
    return new UserDomain({
      id: new Uuid(userPrisma.id),
      email: userPrisma.email,
      passwordHash: new PasswordHash(userPrisma.password_hash),
      createdAt: userPrisma.created_at,
      updatedAt: userPrisma.updated_at,
    });
  }

  public static toDto(user: UserDomain): UserDto {
    return {
      id: user.id.getValue(),
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  public static toPersistence(user: UserDomain): Prisma.UserCreateInput {
    return {
      id: user.id.getValue(),
      email: user.email,
      password_hash: user.passwordHash.getValue(),
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
