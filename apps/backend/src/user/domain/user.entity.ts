import { Uuid, PasswordHash } from '@libs/domain-primitives';

/**
 * Доменная сущность пользователя.
 */
export class User {
  /** Уникальный идентификатор пользователя */
  readonly id: Uuid;
  /** Email пользователя */
  readonly email: string;
  /** Хеш пароля */
  readonly passwordHash: PasswordHash;
  /** Дата создания */
  readonly createdAt: Date;
  /** Дата обновления */
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

  /**
   * Фабричный метод для создания нового пользователя.
   * @param params - Данные для создания пользователя (email, пароль).
   * @returns Promise<User> - Экземпляр доменной сущности User.
   */
  public static async create(params: { email: string; password?: string }): Promise<User> {
    const passwordHash = params.password
      ? await PasswordHash.create(params.password)
      : new PasswordHash('');

    return new User({
      id: Uuid.create(),
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
