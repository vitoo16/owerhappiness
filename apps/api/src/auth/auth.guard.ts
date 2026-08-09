import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { SESSION_COOKIE } from './auth.constants';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

interface SessionToken { sub: string; sid: string; role: 'OWNER'; }

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token) throw this.unauthorized();

    try {
      const payload = await this.jwt.verifyAsync<SessionToken>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      const session = await this.prisma.authSession.findFirst({
        where: { id: payload.sid, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
        include: { user: true },
      });
      if (!session || session.user.role !== 'OWNER') throw this.unauthorized();
      request.user = { id: session.user.id, email: session.user.email, role: 'OWNER', sessionId: session.id };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw this.unauthorized();
    }
  }

  private unauthorized() {
    return new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Authentication required.' });
  }
}
