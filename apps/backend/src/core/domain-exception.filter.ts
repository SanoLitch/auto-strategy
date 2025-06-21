import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  Request, Response,
} from 'express';
import {
  DomainException,
  type DomainExceptionConstructor,
  isDomainExceptionConstructor,
  UserAlreadyExistsError,
  PlayerAlreadyJoinedError,
  SessionIsFullError,
  SessionNotWaitingError,
  MapNotGeneratedError,
  InsufficientResourcesError,
  SessionIsEmptyError,
  SessionStartInWrongStatusError,
  SessionMapSetInWrongStatusError,
} from '@libs/utils';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  private readonly exceptionToStatusMap = new Map<DomainExceptionConstructor, HttpStatus>([
    [UserAlreadyExistsError, HttpStatus.CONFLICT],
    [PlayerAlreadyJoinedError, HttpStatus.CONFLICT],
    [SessionIsFullError, HttpStatus.CONFLICT],
    [SessionNotWaitingError, HttpStatus.BAD_REQUEST],
    [MapNotGeneratedError, HttpStatus.BAD_REQUEST],
    [InsufficientResourcesError, HttpStatus.BAD_REQUEST],
    [SessionIsEmptyError, HttpStatus.BAD_REQUEST],
    [SessionStartInWrongStatusError, HttpStatus.BAD_REQUEST],
    [SessionMapSetInWrongStatusError, HttpStatus.BAD_REQUEST],
  ] as const);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = isDomainExceptionConstructor(exception.constructor)
      ? this.exceptionToStatusMap.get(exception.constructor)
      : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.warn(
      `[${ request.method } ${ request.url }] DomainException: ${ exception.name } - ${ exception.message }`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
