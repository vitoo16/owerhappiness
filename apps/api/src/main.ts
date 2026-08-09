import 'reflect-metadata';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiEnvelopeInterceptor } from './common/interceptors/api-envelope.interceptor';
import { createValidationPipe } from './common/utils/validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('API_PORT');
  const corsOrigin = config.getOrThrow<string>('CORS_ORIGIN');
  const mediaRoot = path.resolve(process.cwd(), config.getOrThrow<string>('MEDIA_ROOT'));

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  app.use(
    helmet({
      ...(isProduction ? {} : { contentSecurityPolicy: false }),
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
  app.useStaticAssets(mediaRoot, {
    prefix: '/uploads/',
    setHeaders: (response) => {
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      response.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
  app.enableShutdownHooks();

  if (config.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Thong Portfolio API')
      .setDescription('Local-first portfolio, CMS and private desk API')
      .setVersion('1.0')
      .addCookieAuth('portfolio_session')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
