import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { OriginGuard } from '../common/guards/origin.guard';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { SESSION_COOKIE } from './auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  @Post('login')
  @UseGuards(OriginGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    response.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      expires: result.expiresAt,
    });
    return result.owner;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(OriginGuard, AuthGuard)
  async logout(@CurrentUser() owner: AuthenticatedUser, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(owner.sessionId);
    response.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax', path: '/' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() owner: AuthenticatedUser) {
    return { id: owner.id, email: owner.email, role: owner.role };
  }
}
