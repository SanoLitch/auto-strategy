import * as bcrypt from 'bcryptjs';

/**
 * Value Object для хеша пароля.
 */
export class PasswordHash {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  /**
   * Создает новый экземпляр PasswordHash из простого пароля.
   * @param password - Пароль в открытом виде.
   */
  public static async create(password: string): Promise<PasswordHash> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return new PasswordHash(hash);
  }

  /**
   * Сравнивает пароль в открытом виде с хешем.
   * @param password - Пароль в открытом виде.
   */
  public async compare(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.value);
  }

  /**
   * Возвращает строковое представление хеша.
   */
  public getValue(): string {
    return this.value;
  }
}