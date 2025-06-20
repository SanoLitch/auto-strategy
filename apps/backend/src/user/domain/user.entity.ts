import {
  Uuid, PasswordHash,
} from '@libs/domain-primitives';

export class User {
  readonly id: Uuid;
  readonly email: string;
  readonly passwordHash: PasswordHash;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: {
    id: Uuid;
    email: string;
    passwordHash: PasswordHash;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  public static async create(params: { email: string; password?: string }): Promise<User> {
    const passwordHash = params.password
      ? await PasswordHash.create(params.password)
      : new PasswordHash('');

    return new User({
      id: new Uuid(),
      email: params.email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Проверяет, соответствует ли переданный пароль хешу пароля пользователя.
   * @param password - Пароль для проверки.
   * @returns Promise<boolean> - true, если пароль совпадает, иначе false.
   */
  public async isPasswordMatching(password: string): Promise<boolean> {
    return this.passwordHash.compare(password);
  }
}
