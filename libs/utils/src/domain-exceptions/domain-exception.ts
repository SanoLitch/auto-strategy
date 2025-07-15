type ErrorWithStack = ErrorConstructor & { captureStackTrace: any };

function isErrorWithStack(e: ErrorConstructor): e is ErrorWithStack {
  return 'captureStackTrace' in e;
}

export type DomainExceptionConstructor = new (...args: any[]) => DomainException;

export function isDomainExceptionConstructor(
  ctor: unknown,
): ctor is DomainExceptionConstructor {
  return typeof ctor === 'function'
    && new (ctor as DomainExceptionConstructor)() instanceof DomainException;
}

export class DomainException extends Error {
  constructor(message?: string) {
    super(message);

    this.name = this.constructor.name;

    if (isErrorWithStack(Error)) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
