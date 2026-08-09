import {
  ConflictException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BlockType } from '@portfolio/contracts';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import type { MediaAsset } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from './local-storage.service';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_SHARP_FORMATS = new Set(['jpeg', 'png', 'webp']);
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_EDGE = 2560;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalStorageService,
    private readonly config: ConfigService,
  ) {}

  async list() {
    const [assets, covers, projectMedia, milestones, playground, blocks] =
      await this.prisma.$transaction([
        this.prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } }),
        this.prisma.project.findMany({
          where: { coverImageId: { not: null } },
          select: { coverImageId: true },
        }),
        this.prisma.projectMedia.findMany({ select: { mediaAssetId: true } }),
        this.prisma.milestone.findMany({
          where: { mediaAssetId: { not: null } },
          select: { mediaAssetId: true },
        }),
        this.prisma.playgroundItem.findMany({
          where: { thumbnailId: { not: null } },
          select: { thumbnailId: true },
        }),
        this.prisma.projectBlock.findMany({ select: { type: true, content: true } }),
      ]);

    const usage = new Map<string, number>();
    const bump = (id: string | null) => {
      if (id) usage.set(id, (usage.get(id) ?? 0) + 1);
    };

    covers.forEach((item) => bump(item.coverImageId));
    projectMedia.forEach((item) => bump(item.mediaAssetId));
    milestones.forEach((item) => bump(item.mediaAssetId));
    playground.forEach((item) => bump(item.thumbnailId));

    const knownIds = new Set(assets.map((asset) => asset.id));
    for (const block of blocks) {
      for (const id of this.mediaIdsFromBlock(block.type as BlockType, block.content)) {
        if (knownIds.has(id)) bump(id);
      }
    }

    return assets.map((asset) => this.map(asset, usage.get(asset.id) ?? 0));
  }

  async upload(file: Express.Multer.File | undefined) {
    if (!file || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException({
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Only JPEG, PNG and WebP images are supported.',
      });
    }

    const maxBytes = this.config.getOrThrow<number>('MAX_UPLOAD_BYTES');
    if (file.size > maxBytes) {
      throw new PayloadTooLargeException({
        code: 'UPLOAD_TOO_LARGE',
        message: 'Image exceeds configured upload size.',
      });
    }

    let pipeline: sharp.Sharp;
    try {
      pipeline = sharp(file.buffer, {
        failOn: 'error',
        limitInputPixels: MAX_INPUT_PIXELS,
      }).rotate();
      const metadata = await pipeline.metadata();
      if (!ALLOWED_SHARP_FORMATS.has(metadata.format ?? '')) {
        throw new Error('Invalid image format');
      }
    } catch {
      throw new UnsupportedMediaTypeException({
        code: 'INVALID_IMAGE',
        message: 'The uploaded file is not a valid supported image.',
      });
    }

    const output = await pipeline
      .resize({
        width: MAX_OUTPUT_EDGE,
        height: MAX_OUTPUT_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const generatedId = randomUUID();
    const storageKey = `media/${generatedId}.webp`;
    await this.storage.save(storageKey, output.data);

    try {
      const asset = await this.prisma.mediaAsset.create({
        data: {
          storageKey,
          fileName: `${generatedId}.webp`,
          originalName: path.basename(file.originalname).slice(0, 255),
          mimeType: 'image/webp',
          width: output.info.width,
          height: output.info.height,
          sizeBytes: output.info.size,
          altText: '',
        },
      });
      return this.map(asset, 0);
    } catch (error) {
      await this.storage.delete(storageKey);
      throw error;
    }
  }

  async update(id: string, altText: string) {
    await this.ensure(id);
    const asset = await this.prisma.mediaAsset.update({
      where: { id },
      data: { altText: altText.trim() },
    });
    return this.map(asset, await this.usageCount(id));
  }

  async delete(id: string) {
    const asset = await this.ensure(id);
    const usage = await this.usageCount(id);
    if (usage > 0) {
      throw new ConflictException({
        code: 'MEDIA_IN_USE',
        message: `Media is referenced ${usage} time(s) and cannot be deleted.`,
      });
    }

    // Delete metadata first only after references are proven absent. If the filesystem
    // cleanup fails, the orphaned immutable file is safer than a dangling DB reference.
    await this.prisma.mediaAsset.delete({ where: { id } });
    await this.storage.delete(asset.storageKey);
  }

  private map(asset: MediaAsset, usage?: number) {
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
      ...(usage === undefined
        ? {}
        : { usageCount: usage, deleteEligible: usage === 0 }),
    };
  }

  private async ensure(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException({
        code: 'MEDIA_NOT_FOUND',
        message: 'Media asset not found.',
      });
    }
    return asset;
  }

  private mediaIdsFromBlock(type: BlockType, content: unknown) {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return [];
    const record = content as Record<string, unknown>;

    if (type === 'IMAGE') {
      return typeof record.mediaAssetId === 'string' ? [record.mediaAssetId] : [];
    }

    if (type === 'IMAGE_GROUP' && Array.isArray(record.mediaAssetIds)) {
      return record.mediaAssetIds.filter(
        (value): value is string => typeof value === 'string',
      );
    }

    return [];
  }

  private async usageCount(id: string) {
    const [covers, gallery, milestones, playground, blocks] = await this.prisma.$transaction([
      this.prisma.project.count({ where: { coverImageId: id } }),
      this.prisma.projectMedia.count({ where: { mediaAssetId: id } }),
      this.prisma.milestone.count({ where: { mediaAssetId: id } }),
      this.prisma.playgroundItem.count({ where: { thumbnailId: id } }),
      this.prisma.projectBlock.findMany({ select: { type: true, content: true } }),
    ]);

    const blockReferences = blocks.filter((block) =>
      this.mediaIdsFromBlock(block.type as BlockType, block.content).includes(id),
    ).length;

    return covers + gallery + milestones + playground + blockReferences;
  }
}
