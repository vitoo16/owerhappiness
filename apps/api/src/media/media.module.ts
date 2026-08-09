import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { LocalStorageService } from './local-storage.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    AuthModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limits: { fileSize: config.getOrThrow<number>('MAX_UPLOAD_BYTES'), files: 1 },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, LocalStorageService],
  exports: [MediaService],
})
export class MediaModule {}
