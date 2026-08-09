import { BadRequestException, Injectable } from '@nestjs/common';
import {
  isPublicSettingKey,
  publicSettingKeys,
  validateSetting,
} from '@portfolio/contracts';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async public() {
    const rows = await this.prisma.siteSetting.findMany({
      where: { key: { in: [...publicSettingKeys] } },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  async all() {
    const rows = await this.prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  async put(key: string, value: unknown) {
    if (!isPublicSettingKey(key)) {
      throw new BadRequestException({
        code: 'UNKNOWN_SETTING',
        message: 'Unknown setting key.',
      });
    }

    const parsed = validateSetting(key, value);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'INVALID_SETTING',
        message: parsed.error,
        fields: { value: parsed.error },
      });
    }

    const jsonValue = parsed.data as Prisma.InputJsonValue;
    await this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: jsonValue },
      update: { value: jsonValue },
    });

    return { key, value: parsed.data };
  }
}
