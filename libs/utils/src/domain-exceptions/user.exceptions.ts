import { DomainException } from "./domain-exception";

export class UserAlreadyExistsError extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists.`);
  }
}

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super('Invalid credentials provided.');
  }
}