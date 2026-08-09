import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { OwnerGuard } from './owner.guard';
import { OriginGuard } from '../common/guards/origin.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, OwnerGuard, OriginGuard],
  exports: [JwtModule, AuthGuard, OwnerGuard, OriginGuard],
})
export class AuthModule {}
