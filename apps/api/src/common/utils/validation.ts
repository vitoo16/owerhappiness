import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

function flattenErrors(errors: ValidationError[], prefix = '', out: Record<string, string> = {}) {
  for (const error of errors) {
    const key = prefix ? `${prefix}.${error.property}` : error.property;
    if (error.constraints) {
      out[key] = Object.values(error.constraints)[0] ?? 'Invalid value';
    }
    if (error.children?.length) flattenErrors(error.children, key, out);
  }
  return out;
}

export function createValidationPipe() {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: false },
    exceptionFactory: (errors) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Some fields are invalid.',
        fields: flattenErrors(errors),
      }),
  });
}
