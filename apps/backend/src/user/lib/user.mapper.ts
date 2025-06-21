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
      passwordHash: new PasswordHash(userPrisma.passwordHash),
      createdAt: userPrisma.createdAt,
      updatedAt: userPrisma.updatedAt,
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
      passwordHash: user.passwordHash.getValue(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
