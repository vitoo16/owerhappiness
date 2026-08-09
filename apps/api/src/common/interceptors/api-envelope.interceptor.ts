import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export class ApiPayload<T> {
  constructor(
    readonly data: T,
    readonly meta?: Record<string, unknown>,
  ) {}
}

@Injectable()
export class ApiEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (value instanceof ApiPayload) {
          return {
            success: true,
            data: value.data,
            ...(value.meta ? { meta: value.meta } : { meta: {} }),
          };
        }
        return { success: true, data: value ?? null, meta: {} };
      }),
    );
  }
}
