import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;

    const expected = this.config.getOrThrow<string>('CORS_ORIGIN');
    const apiPort = this.config.getOrThrow<number>('API_PORT');
    const developmentApiOrigin = `http://localhost:${apiPort}`;
    const origin = request.get('origin');
    const referer = request.get('referer');

    if (origin === expected) return true;
    if (this.config.get<string>('NODE_ENV') !== 'production' && origin === developmentApiOrigin) return true;
    if (!origin && referer?.startsWith(`${expected}/`)) return true;
    if (!origin && !referer && !request.get('sec-fetch-site')) return true;

    throw new ForbiddenException({
      code: 'ORIGIN_REJECTED',
      message: 'The request origin is not allowed.',
    });
  }
}
