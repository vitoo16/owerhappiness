import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MulterError } from 'multer';

interface ErrorPayload {
  code?: string;
  message?: string | string[];
  fields?: Record<string, string>;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Something went wrong.';
    let fields: Record<string, string> | undefined;

    if (exception instanceof MulterError) {
      status = exception.code === 'LIMIT_FILE_SIZE' ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.BAD_REQUEST;
      code = exception.code === 'LIMIT_FILE_SIZE' ? 'UPLOAD_TOO_LARGE' : 'UPLOAD_ERROR';
      message = exception.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large.' : 'The uploaded file is invalid.';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const payload = body as ErrorPayload;
        code = payload.code ?? this.codeForStatus(status);
        message = Array.isArray(payload.message)
          ? payload.message.join(' ')
          : payload.message ?? exception.message;
        fields = payload.fields;
      }
    } else if (this.isPrismaKnownError(exception)) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONFLICT';
        message = 'A unique field is already in use.';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = 'The requested resource was not found.';
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
    });
  }

  private codeForStatus(status: number) {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'UNAUTHENTICATED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 413:
        return 'UPLOAD_TOO_LARGE';
      case 415:
        return 'UNSUPPORTED_MEDIA_TYPE';
      default:
        return 'HTTP_ERROR';
    }
  }

  private isPrismaKnownError(value: unknown): value is { code: string } {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'code' in value &&
        typeof (value as { code?: unknown }).code === 'string' &&
        String((value as { code: string }).code).startsWith('P'),
    );
  }
}
