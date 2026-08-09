import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { normalizeSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { ReorderPlaygroundDto, UpsertPlaygroundDto } from './dto/playground.dto';

const playgroundInclude = {
  thumbnail: true,
} satisfies Prisma.PlaygroundItemInclude;

type PlaygroundRecord = Prisma.PlaygroundItemGetPayload<{
  include: typeof playgroundInclude;
}>;

@Injectable()
export class PlaygroundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async publicList() {
    const items = await this.prisma.playgroundItem.findMany({
      where: { status: 'PUBLISHED' },
      include: playgroundInclude,
      orderBy: { sortOrder: 'asc' },
    });
    return items.map((item) => this.map(item));
  }

  async publicBySlug(rawSlug: string) {
    const item = await this.prisma.playgroundItem.findFirst({
      where: {
        slug: normalizeSlug(rawSlug),
        status: 'PUBLISHED',
      },
      include: playgroundInclude,
    });

    if (!item) this.notFound();
    return this.map(item);
  }

  async adminList() {
    const items = await this.prisma.playgroundItem.findMany({
      include: playgroundInclude,
      orderBy: { sortOrder: 'asc' },
    });
    return items.map((item) => this.map(item));
  }

  async create(dto: UpsertPlaygroundDto) {
    const slug = normalizeSlug(dto.slug || dto.title);
    await this.assertSlugAvailable(slug);
    await this.assertMediaExists(dto.thumbnailId);

    const item = await this.prisma.playgroundItem.create({
      data: {
        ...this.toData(dto),
        slug,
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
      },
      include: playgroundInclude,
    });

    return this.map(item);
  }

  async update(id: string, dto: UpsertPlaygroundDto) {
    const current = await this.getExisting(id);
    const slug = normalizeSlug(dto.slug || dto.title);
    await this.assertSlugAvailable(slug, id);
    await this.assertMediaExists(dto.thumbnailId);

    const item = await this.prisma.playgroundItem.update({
      where: { id },
      data: {
        ...this.toData(dto),
        slug,
        publishedAt:
          dto.status === 'PUBLISHED' ? (current.publishedAt ?? new Date()) : current.publishedAt,
      },
      include: playgroundInclude,
    });

    return this.map(item);
  }

  async delete(id: string) {
    await this.getExisting(id);
    await this.prisma.playgroundItem.delete({ where: { id } });
  }

  async reorder(dto: ReorderPlaygroundDto) {
    const items = await this.prisma.playgroundItem.findMany({ select: { id: true } });
    const actual = new Set(items.map((item) => item.id));
    if (
      dto.playgroundIds.length !== actual.size ||
      new Set(dto.playgroundIds).size !== dto.playgroundIds.length ||
      dto.playgroundIds.some((id) => !actual.has(id))
    ) {
      throw new BadRequestException({
        code: 'INVALID_PLAYGROUND_ORDER',
        message: 'Order must contain every playground item exactly once.',
      });
    }

    await this.prisma.$transaction(
      dto.playgroundIds.map((id, sortOrder) =>
        this.prisma.playgroundItem.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { updated: dto.playgroundIds.length };
  }

  private map(item: PlaygroundRecord) {
    const content =
      item.content && typeof item.content === 'object' && !Array.isArray(item.content)
        ? item.content
        : {};

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      type: item.type,
      status: item.status,
      content,
      thumbnail: this.projects.mapMedia(item.thumbnail),
      liveUrl: item.liveUrl,
      sourceUrl: item.sourceUrl,
      sortOrder: item.sortOrder,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private toData(dto: UpsertPlaygroundDto): Prisma.PlaygroundItemUncheckedCreateInput {
    return {
      title: dto.title.trim(),
      slug: normalizeSlug(dto.slug || dto.title),
      summary: dto.summary.trim(),
      type: dto.type.trim(),
      status: dto.status,
      content: dto.content as Prisma.InputJsonValue,
      thumbnailId: dto.thumbnailId || null,
      liveUrl: dto.liveUrl || null,
      sourceUrl: dto.sourceUrl || null,
      sortOrder: dto.sortOrder,
    };
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const item = await this.prisma.playgroundItem.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (item) {
      throw new ConflictException({
        code: 'SLUG_CONFLICT',
        message: 'Slug already in use.',
        fields: { slug: 'Already in use' },
      });
    }
  }

  private async getExisting(id: string) {
    const item = await this.prisma.playgroundItem.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });
    if (!item) this.notFound();
    return item;
  }

  private notFound(): never {
    throw new NotFoundException({
      code: 'PLAYGROUND_NOT_FOUND',
      message: 'Playground item not found.',
    });
  }

  private async assertMediaExists(id: string | null | undefined) {
    if (!id) return;
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!asset) {
      throw new BadRequestException({
        code: 'INVALID_MEDIA_REFERENCE',
        message: 'The selected playground thumbnail does not exist.',
        fields: { thumbnailId: 'Not found' },
      });
    }
  }
}
