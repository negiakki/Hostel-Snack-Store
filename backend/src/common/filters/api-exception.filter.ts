import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  message: string;
}

interface ErrorBody {
  success?: unknown;
  message?: unknown;
}

const fallbackMessages: Record<number, string> = {
  400: 'Invalid request.',
  401: 'Authentication is required.',
  403: 'You do not have permission to perform this action.',
  404: 'Not found.',
  409: 'This request conflicts with the current data.',
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logUnexpectedException(exception, request);
    }

    response.status(status).json(this.toResponse(exception, status));
  }

  private toResponse(exception: unknown, status: number): ErrorResponse {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (this.isErrorResponse(response)) {
        return { success: false, message: response.message };
      }
    }

    return {
      success: false,
      message:
        fallbackMessages[status] ?? 'Something went wrong. Please try again.',
    };
  }

  private isErrorResponse(
    value: unknown,
  ): value is { success: false; message: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as ErrorBody).success === false &&
      typeof (value as ErrorBody).message === 'string'
    );
  }

  private logUnexpectedException(exception: unknown, request: Request): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown server error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `${request.method} ${request.originalUrl}: ${message}`,
      stack,
    );
  }
}
