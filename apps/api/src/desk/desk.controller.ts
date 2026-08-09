import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { utilityKeySchema, utilityNamespaceSchema } from '@portfolio/contracts';
import type { Prisma } from '../generated/prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { OriginGuard } from '../common/guards/origin.guard';
import { PrismaService } from '../prisma/prisma.service';

interface UtilityValueBody {
  value: Prisma.InputJsonValue;
}

@Controller('desk')
@UseGuards(AuthGuard, OwnerGuard)
export class DeskController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('data/:namespace/:key')
  async getValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
  ) {
    this.assertValidKey(namespace, key);

    const row = await this.prisma.utilityData.findUnique({
      where: {
        userId_namespace_key: {
          userId: user.id,
          namespace,
          key,
        },
      },
    });

    return row?.value ?? null;
  }

  @Put('data/:namespace/:key')
  @UseGuards(OriginGuard)
  async putValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
    @Body() body: UtilityValueBody,
  ) {
    this.assertValidKey(namespace, key);

    const row = await this.prisma.utilityData.upsert({
      where: {
        userId_namespace_key: {
          userId: user.id,
          namespace,
          key,
        },
      },
      create: {
        userId: user.id,
        namespace,
        key,
        value: body.value,
      },
      update: { value: body.value },
    });

    return row.value;
  }

  @Delete('data/:namespace/:key')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteValue(
    @CurrentUser() user: AuthenticatedUser,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
  ) {
    this.assertValidKey(namespace, key);
    await this.prisma.utilityData.deleteMany({
      where: { userId: user.id, namespace, key },
    });
  }

  private assertValidKey(namespace: string, key: string) {
    const validNamespace = utilityNamespaceSchema.safeParse(namespace).success;
    const validKey = utilityKeySchema.safeParse(key).success;

    if (!validNamespace || !validKey) {
      throw new BadRequestException({
        code: 'INVALID_UTILITY_KEY',
        message: 'Invalid utility namespace or key.',
      });
    }
  }
}
