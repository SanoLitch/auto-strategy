import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import {
  Request, Response,
} from 'express';
import {
  hasMessage,
  hasStack,
} from '@libs/utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let isUnhandled = false;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (hasMessage(res)) {
        message = res.message;
      }
      const logMsg = `HttpException: ${ status } ${ request.method } ${ request.url } - ${ JSON.stringify(message) }`;

      this.logger.error(logMsg);
    } else {
      isUnhandled = true;

      if (hasMessage(exception)) {
        message = exception.message;
      }
      const logMsg = `Unhandled exception: ${ request.method } ${ request.url }`;

      this.logger.error(logMsg, hasStack(exception) ? exception.stack : String(exception));
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isUnhandled ? `UNHANDLED: ${ message }` : message,
    });
  }
}
