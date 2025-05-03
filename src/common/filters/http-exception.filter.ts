import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const resBody = exception.getResponse();

    /** Extract/normalise message */
    let message = 'Unexpected error';
    if (typeof resBody === 'string') message = resBody;
    else if (resBody && typeof resBody === 'object' && 'message' in resBody)
      message = (resBody as { message: string }).message;

    /* Extra metadata */
    const payload = {
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    /* Log only 5xx or explicit 403 for audit */
    if (status >= 500 || status === 403)
      this.logger.warn(JSON.stringify(payload));

    response.status(status).json(payload);
  }
}
