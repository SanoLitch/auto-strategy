import { randomUUID } from 'crypto';

/**
 * Value Object для уникального идентификатора (UUID).
 */
export class Uuid {
  private readonly value: string;

  constructor(value: string) {
    // TODO: Добавить валидацию формата UUID
    this.value = value;
  }

  /**
   * Создает новый экземпляр Uuid со сгенерированным значением.
   */
  public static create(): Uuid {
    return new Uuid(randomUUID());
  }

  /**
   * Возвращает строковое представление UUID.
   */
  public getValue(): string {
    return this.value;
  }
}