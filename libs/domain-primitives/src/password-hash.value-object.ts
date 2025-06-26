import * as bcrypt from 'bcryptjs';

export class PasswordHash {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  public static async create(password: string): Promise<PasswordHash> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return new PasswordHash(hash);
  }

  public async compare(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.value);
  }

  public getValue(): string {
    return this.value;
  }
}
