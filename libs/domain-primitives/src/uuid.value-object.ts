import { randomUUID } from 'crypto';

/**
 * Value Object для уникального идентификатора (UUID).
 */
export class Uuid {

  constructor(private readonly value: string = randomUUID()) {}

  /**
   * Возвращает строковое представление UUID.
   */
  public getValue(): string {
    return this.value;
  }
}