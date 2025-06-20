/**
 * DTO для публичного представления пользователя.
 */
export class UserDto {
  /**
   * Уникальный идентификатор пользователя.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  readonly id: string;

  /**
   * Email пользователя.
   * @example "user@example.com"
   */
  readonly email: string;

  /**
   * Дата создания.
   */
  readonly createdAt: Date;

  /**
   * Дата обновления.
   */
  readonly updatedAt: Date;
}
