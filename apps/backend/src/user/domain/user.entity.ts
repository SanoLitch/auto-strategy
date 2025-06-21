import {
  Uuid, PasswordHash,
} from '@libs/domain-primitives';

export class User {
  public readonly id: Uuid;
  public readonly email: string;
  public readonly passwordHash: PasswordHash;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

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

  public async isPasswordMatching(password: string): Promise<boolean> {
    return this.passwordHash.compare(password);
  }
}
