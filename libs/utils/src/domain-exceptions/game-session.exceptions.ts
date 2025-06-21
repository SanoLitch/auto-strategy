import { DomainException } from "./domain-exception";

export class SessionNotWaitingError extends DomainException {
  constructor(status: string) {
    super(`Cannot perform action because session status is '${status}' instead of 'WAITING'.`);
  }
}

export class MapNotGeneratedError extends DomainException {
  constructor() {
    super('Cannot add player before a map has been generated for the session.');
  }
}

export class PlayerAlreadyJoinedError extends DomainException {
  constructor(userId: string) {
    super(`Player with ID ${userId} has already joined this session.`);
  }
}

export class SessionIsFullError extends DomainException {
  constructor(limit: number) {
    super(`Session is full. Player limit of ${limit} has been reached.`);
  }
}