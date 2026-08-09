import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { normalizeSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UpsertPlaygroundDto } from './dto/playground.dto';

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

    const item = await this.prisma.playgroundItem.update({
      where: { id },
      data: {
        ...this.toData(dto),
        slug,
        publishedAt:
          dto.status === 'PUBLISHED'
            ? current.publishedAt ?? new Date()
            : current.publishedAt,
      },
      include: playgroundInclude,
    });

    return this.map(item);
  }

  async delete(id: string) {
    await this.getExisting(id);
    await this.prisma.playgroundItem.delete({ where: { id } });
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
}
