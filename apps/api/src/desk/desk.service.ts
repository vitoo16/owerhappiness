import { BadRequestException, Injectable } from '@nestjs/common';
import type { DeskOverviewDto } from '@portfolio/contracts';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MAX_UTILITY_VALUE_BYTES = 200_000;
const DESK_UTILITY_COUNT = 8;

@Injectable()
export class DeskService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string): Promise<DeskOverviewDto> {
    const [projects, publishedProjects, draftProjects, milestones, utilityRows] =
      await this.prisma.$transaction([
        this.prisma.project.count(),
        this.prisma.project.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.project.count({ where: { status: 'DRAFT' } }),
        this.prisma.milestone.count(),
        this.prisma.utilityData.findMany({
          where: {
            userId,
            namespace: { in: ['notes', 'snippets', 'bookmarks'] },
            key: { in: ['collection', 'main'] },
          },
          select: { namespace: true, key: true, value: true },
        }),
      ]);

    const collectionCount = (namespace: string) => {
      const collection = utilityRows.find(
        (row) => row.namespace === namespace && row.key === 'collection',
      );
      return Array.isArray(collection?.value) ? collection.value.length : 0;
    };

    const legacyScratch = utilityRows.find(
      (row) => row.namespace === 'notes' && row.key === 'main',
    );
    const legacyNoteCount =
      typeof legacyScratch?.value === 'string' && legacyScratch.value.trim() ? 1 : 0;

    return {
      projects,
      publishedProjects,
      draftProjects,
      milestones,
      notes: collectionCount('notes') + legacyNoteCount,
      snippets: collectionCount('snippets'),
      bookmarks: collectionCount('bookmarks'),
      utilities: DESK_UTILITY_COUNT,
    };
  }

  async getValue(userId: string, namespace: string, key: string) {
    const row = await this.prisma.utilityData.findUnique({
      where: { userId_namespace_key: { userId, namespace, key } },
    });
    return row?.value ?? null;
  }

  async putValue(userId: string, namespace: string, key: string, value: unknown) {
    const jsonValue = this.asJsonValue(value);
    const row = await this.prisma.utilityData.upsert({
      where: { userId_namespace_key: { userId, namespace, key } },
      create: { userId, namespace, key, value: jsonValue },
      update: { value: jsonValue },
    });
    return row.value;
  }

  async deleteValue(userId: string, namespace: string, key: string) {
    await this.prisma.utilityData.deleteMany({ where: { userId, namespace, key } });
  }

  private asJsonValue(value: unknown): Prisma.InputJsonValue {
    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch {
      throw new BadRequestException({
        code: 'INVALID_UTILITY_VALUE',
        message: 'Utility data must be valid JSON.',
      });
    }

    if (serialized === undefined) {
      throw new BadRequestException({
        code: 'INVALID_UTILITY_VALUE',
        message: 'Utility data is required.',
      });
    }

    if (Buffer.byteLength(serialized, 'utf8') > MAX_UTILITY_VALUE_BYTES) {
      throw new BadRequestException({
        code: 'UTILITY_VALUE_TOO_LARGE',
        message: 'Utility data is too large to store.',
      });
    }

    return value as Prisma.InputJsonValue;
  }
}
