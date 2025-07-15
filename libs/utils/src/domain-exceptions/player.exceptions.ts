import { DomainException } from './domain-exception';

export class InsufficientResourcesError extends DomainException {
  constructor() {
    super('Player does not have enough resources for this action.');
  }
}
