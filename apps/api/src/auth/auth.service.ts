import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    const valid = user ? await argon2.verify(user.passwordHash, password) : false;
    if (!user || !valid || user.role !== 'OWNER') {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    await this.prisma.authSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });

    const hours = this.config.getOrThrow<number>('SESSION_TTL_HOURS');
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const session = await this.prisma.authSession.create({ data: { userId: user.id, expiresAt } });
    const token = await this.jwt.signAsync(
      { sub: user.id, sid: session.id, role: 'OWNER' },
      { secret: this.config.getOrThrow<string>('JWT_SECRET'), expiresIn: hours * 60 * 60 },
    );
    return { token, expiresAt, owner: { id: user.id, email: user.email, role: 'OWNER' as const } };
  }

  async logout(sessionId: string) {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
