import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  blockMediaReferences,
  parseBlockContent,
  type BlockType,
} from '@portfolio/contracts';
import type { MediaAsset, Prisma, ProjectBlock } from '../generated/prisma/client';
import { normalizeSlug } from '../common/utils/slug';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBlockDto,
  CreateProjectDto,
  ProjectQueryDto,
  ReorderBlocksDto,
  UpdateBlockDto,
  UpdateProjectDto,
  UpdateProjectMediaDto,
} from './dto/project.dto';

const projectListInclude = { coverImage: true } satisfies Prisma.ProjectInclude;
const projectDetailInclude = {
  coverImage: true,
  blocks: { orderBy: { sortOrder: 'asc' as const } },
  media: {
    include: { mediaAsset: true },
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.ProjectInclude;

type ProjectListRecord = Prisma.ProjectGetPayload<{ include: typeof projectListInclude }>;
type ProjectDetailRecord = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  mapMedia(asset: MediaAsset | null) {
    if (!asset) return null;
    return {
      id: asset.id,
      url: `/uploads/${asset.storageKey}`,
      fileName: asset.fileName,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      sizeBytes: asset.sizeBytes,
      altText: asset.altText,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }

  mapProject(project: ProjectListRecord) {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: project.description,
      type: project.type,
      status: project.status,
      year: project.year,
      role: project.role,
      client: project.client,
      technologies: this.stringList(project.technologies),
      services: this.stringList(project.services),
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      behanceUrl: project.behanceUrl,
      externalUrl: project.externalUrl,
      featured: project.featured,
      sortOrder: project.sortOrder,
      coverOmitted: project.coverOmitted,
      coverImage: this.mapMedia(project.coverImage),
      publishedAt: project.publishedAt?.toISOString() ?? null,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  mapBlock(block: ProjectBlock) {
    return {
      id: block.id,
      projectId: block.projectId,
      type: block.type,
      content: block.content,
      sortOrder: block.sortOrder,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    };
  }

  async publicList(query: ProjectQueryDto) {
    const where: Prisma.ProjectWhereInput = { status: 'PUBLISHED' };
    this.applyListFilters(where, query, false);
    return this.list(where, query);
  }

  async adminList(query: ProjectQueryDto) {
    const where: Prisma.ProjectWhereInput = {};
    this.applyListFilters(where, query, true);
    return this.list(where, query);
  }

  async publicBySlug(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug: normalizeSlug(slug), status: 'PUBLISHED' },
      include: projectDetailInclude,
    });
    if (!project) this.notFound();
    return this.mapDetailWithReferencedMedia(project);
  }

  async adminById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectDetailInclude,
    });
    if (!project) this.notFound();
    return this.mapDetailWithReferencedMedia(project);
  }

  async create(dto: CreateProjectDto) {
    const slug = normalizeSlug(dto.slug || dto.title);
    await this.assertSlugAvailable(slug);

    if (dto.status === 'PUBLISHED') {
      throw new BadRequestException({
        code: 'INVALID_INITIAL_STATE',
        message: 'Create as draft, then publish after validation.',
      });
    }

    const project = await this.prisma.project.create({
      data: { ...this.projectData(dto), slug, status: 'DRAFT' },
      include: projectListInclude,
    });
    return this.mapProject(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) this.notFound();

    const slug = dto.slug === undefined ? existing.slug : normalizeSlug(dto.slug);
    await this.assertSlugAvailable(slug, id);
    if (dto.status !== undefined && dto.status !== existing.status) {
      throw new BadRequestException({
        code: 'USE_LIFECYCLE_ACTION',
        message: 'Use the publish, unpublish or archive action to change project status.',
      });
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: { ...this.projectUpdateData(dto), slug, status: existing.status },
      include: projectListInclude,
    });
    return this.mapProject(project);
  }

  async publish(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { blocks: true, coverImage: true },
    });
    if (!project) this.notFound();

    const missing: string[] = [];
    if (!project.title.trim()) missing.push('title');
    if (!project.slug.trim()) missing.push('slug');
    if (!project.summary.trim()) missing.push('summary');
    if (!project.role.trim()) missing.push('role');
    if (!project.coverImageId && !project.coverOmitted) missing.push('coverImage');

    const referencesByBlock = new Map<
      string,
      ReturnType<typeof blockMediaReferences>
    >();
    const referencedIds = new Set<string>();

    for (const block of project.blocks) {
      try {
        const references = blockMediaReferences(
          block.type as BlockType,
          block.content,
        );
        referencesByBlock.set(block.id, references);
        references.forEach((reference) => referencedIds.add(reference.mediaAssetId));
      } catch {
        missing.push(`block:${block.id}`);
      }
    }

    const referencedMedia = referencedIds.size
      ? await this.prisma.mediaAsset.findMany({
          where: { id: { in: [...referencedIds] } },
        })
      : [];
    const mediaById = new Map(referencedMedia.map((asset) => [asset.id, asset]));

    if (referencedMedia.length !== referencedIds.size) {
      missing.push('blockMedia');
    }

    for (const [blockId, references] of referencesByBlock) {
      const missingAlt = references.some((reference) => {
        const asset = mediaById.get(reference.mediaAssetId);
        return !reference.altOverride?.trim() && !asset?.altText.trim();
      });
      if (missingAlt) missing.push(`blockAlt:${blockId}`);
    }

    if (missing.length) {
      throw new BadRequestException({
        code: 'PUBLISH_VALIDATION_FAILED',
        message: 'Project is not ready to publish.',
        fields: Object.fromEntries(missing.map((key) => [key, 'Required or invalid'])),
      });
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: project.publishedAt ?? new Date() },
      include: projectListInclude,
    });
    return this.mapProject(updated);
  }

  async unpublish(id: string) {
    return this.transition(id, 'DRAFT');
  }

  async archive(id: string) {
    return this.transition(id, 'ARCHIVED');
  }

  async delete(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) this.notFound();
    if (project.status !== 'DRAFT') {
      throw new ConflictException({
        code: 'DELETE_REQUIRES_DRAFT',
        message: 'Unpublish the project to draft before destructive deletion.',
      });
    }
    await this.prisma.project.delete({ where: { id } });
  }

  async updateGallery(projectId: string, dto: UpdateProjectMediaDto) {
    await this.ensureProject(projectId);
    const mediaAssetIds = [...new Set(dto.mediaAssetIds)];

    if (mediaAssetIds.length) {
      const count = await this.prisma.mediaAsset.count({
        where: { id: { in: mediaAssetIds } },
      });
      if (count !== mediaAssetIds.length) {
        throw new BadRequestException({
          code: 'INVALID_MEDIA_REFERENCE',
          message: 'One or more gallery assets do not exist.',
        });
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.projectMedia.deleteMany({ where: { projectId, role: 'GALLERY' } });
      if (mediaAssetIds.length) {
        await tx.projectMedia.createMany({
          data: mediaAssetIds.map((mediaAssetId, sortOrder) => ({
            projectId,
            mediaAssetId,
            role: 'GALLERY',
            sortOrder,
          })),
        });
      }
    });
    return this.adminById(projectId);
  }

  async addBlock(projectId: string, dto: CreateBlockDto) {
    await this.ensureProject(projectId);
    const content = this.parseBlock(dto.type, dto.content);
    const last = await this.prisma.projectBlock.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    const block = await this.prisma.projectBlock.create({
      data: {
        projectId,
        type: dto.type as BlockType,
        content: content as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? (last._max.sortOrder ?? -1) + 1,
      },
    });
    return this.mapBlock(block);
  }

  async updateBlock(projectId: string, blockId: string, dto: UpdateBlockDto) {
    const existing = await this.prisma.projectBlock.findFirst({
      where: { id: blockId, projectId },
    });
    if (!existing) {
      throw new NotFoundException({ code: 'BLOCK_NOT_FOUND', message: 'Block not found.' });
    }

    const content = this.parseBlock(dto.type, dto.content);
    const block = await this.prisma.projectBlock.update({
      where: { id: blockId },
      data: {
        type: dto.type as BlockType,
        content: content as Prisma.InputJsonValue,
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
    return this.mapBlock(block);
  }

  async deleteBlock(projectId: string, blockId: string) {
    const block = await this.prisma.projectBlock.findFirst({
      where: { id: blockId, projectId },
      select: { id: true },
    });
    if (!block) {
      throw new NotFoundException({ code: 'BLOCK_NOT_FOUND', message: 'Block not found.' });
    }
    await this.prisma.projectBlock.delete({ where: { id: blockId } });
  }

  async reorderBlocks(projectId: string, dto: ReorderBlocksDto) {
    await this.ensureProject(projectId);
    const blocks = await this.prisma.projectBlock.findMany({
      where: { projectId },
      select: { id: true },
    });
    const actual = new Set(blocks.map((block) => block.id));
    if (
      dto.blockIds.length !== actual.size ||
      new Set(dto.blockIds).size !== dto.blockIds.length ||
      dto.blockIds.some((id) => !actual.has(id))
    ) {
      throw new BadRequestException({
        code: 'INVALID_BLOCK_ORDER',
        message: 'Order must contain every project block exactly once.',
      });
    }

    await this.prisma.$transaction(
      dto.blockIds.map((id, sortOrder) =>
        this.prisma.projectBlock.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return this.adminById(projectId);
  }

  private async list(where: Prisma.ProjectWhereInput, query: ProjectQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: projectListInclude,
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { year: 'desc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: items.map((project) => this.mapProject(project)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  private applyListFilters(
    where: Prisma.ProjectWhereInput,
    query: ProjectQueryDto,
    includeStatus: boolean,
  ) {
    if (query.type) where.type = query.type;
    if (includeStatus && query.status) where.status = query.status;
    if (query.featured !== undefined) where.featured = query.featured;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { summary: { contains: query.q, mode: 'insensitive' } },
      ];
    }
  }

  private projectData(dto: CreateProjectDto) {
    return {
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      description: dto.description?.trim() || null,
      type: dto.type,
      year: dto.year,
      role: dto.role.trim(),
      client: dto.client?.trim() || null,
      technologies: this.cleanList(dto.technologies),
      services: this.cleanList(dto.services),
      githubUrl: dto.githubUrl || null,
      liveUrl: dto.liveUrl || null,
      behanceUrl: dto.behanceUrl || null,
      externalUrl: dto.externalUrl || null,
      featured: dto.featured ?? false,
      sortOrder: dto.sortOrder ?? 0,
      coverImageId: dto.coverImageId || null,
      coverOmitted: dto.coverOmitted ?? false,
    };
  }

  private projectUpdateData(dto: UpdateProjectDto): Prisma.ProjectUncheckedUpdateInput {
    return {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.summary !== undefined ? { summary: dto.summary.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.year !== undefined ? { year: dto.year } : {}),
      ...(dto.role !== undefined ? { role: dto.role.trim() } : {}),
      ...(dto.client !== undefined ? { client: dto.client?.trim() || null } : {}),
      ...(dto.technologies !== undefined ? { technologies: this.cleanList(dto.technologies) } : {}),
      ...(dto.services !== undefined ? { services: this.cleanList(dto.services) } : {}),
      ...(dto.githubUrl !== undefined ? { githubUrl: dto.githubUrl || null } : {}),
      ...(dto.liveUrl !== undefined ? { liveUrl: dto.liveUrl || null } : {}),
      ...(dto.behanceUrl !== undefined ? { behanceUrl: dto.behanceUrl || null } : {}),
      ...(dto.externalUrl !== undefined ? { externalUrl: dto.externalUrl || null } : {}),
      ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      ...(dto.coverImageId !== undefined ? { coverImageId: dto.coverImageId || null } : {}),
      ...(dto.coverOmitted !== undefined ? { coverOmitted: dto.coverOmitted } : {}),
    };
  }

  private cleanList(values: string[]) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  private stringList(value: Prisma.JsonValue): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }

  private parseBlock(type: string, content: unknown) {
    try {
      return parseBlockContent(type as BlockType, content);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'issues' in error
          ? String((error as { issues?: Array<{ message?: string }> }).issues?.[0]?.message ?? 'Invalid block payload')
          : 'Invalid block payload';
      throw new BadRequestException({
        code: 'INVALID_BLOCK',
        message: 'Block content is invalid.',
        fields: { content: message },
      });
    }
  }


  private async mapDetailWithReferencedMedia(project: ProjectDetailRecord) {
    const ids = new Set<string>();
    for (const block of project.blocks) {
      try {
        blockMediaReferences(block.type as BlockType, block.content).forEach(
          (reference) => ids.add(reference.mediaAssetId),
        );
      } catch {
        // Admin may still need to open an old invalid draft to repair it.
      }
    }
    project.media.forEach((relation) => ids.add(relation.mediaAssetId));
    if (project.coverImageId) ids.add(project.coverImageId);

    const referenced = ids.size
      ? await this.prisma.mediaAsset.findMany({ where: { id: { in: [...ids] } } })
      : [];

    return {
      ...this.mapProject(project),
      blocks: project.blocks.map((block) => this.mapBlock(block)),
      media: referenced.map((asset) => this.mapMedia(asset)),
      galleryMediaIds: project.media
        .filter((relation) => relation.role === 'GALLERY')
        .map((relation) => relation.mediaAssetId),
    };
  }

  private async transition(id: string, status: 'DRAFT' | 'ARCHIVED') {
    const project = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!project) this.notFound();
    const updated = await this.prisma.project.update({
      where: { id },
      data: { status },
      include: projectListInclude,
    });
    return this.mapProject(updated);
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    if (!slug) {
      throw new BadRequestException({ code: 'INVALID_SLUG', message: 'Slug is required.' });
    }
    const found = await this.prisma.project.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (found) {
      throw new ConflictException({
        code: 'SLUG_CONFLICT',
        message: 'Slug already in use.',
        fields: { slug: 'Already in use' },
      });
    }
  }

  private async ensureProject(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!project) this.notFound();
  }

  private notFound(): never {
    throw new NotFoundException({ code: 'PROJECT_NOT_FOUND', message: 'Project not found.' });
  }
}
