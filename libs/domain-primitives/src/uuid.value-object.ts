import { randomUUID } from 'crypto';

export class Uuid {

  constructor(private readonly value: string = randomUUID()) {}

  public getValue(): string {
    return this.value;
  }
}