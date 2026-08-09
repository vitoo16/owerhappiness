import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { ReorderMilestonesDto, UpsertMilestoneDto } from './dto/milestone.dto';

const milestoneInclude = {
  mediaAsset: true,
} satisfies Prisma.MilestoneInclude;

type MilestoneRecord = Prisma.MilestoneGetPayload<{
  include: typeof milestoneInclude;
}>;

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async publicList() {
    const milestones = await this.prisma.milestone.findMany({
      where: { visible: true },
      include: milestoneInclude,
      orderBy: [{ sortOrder: 'asc' }, { date: 'asc' }],
    });
    return milestones.map((milestone) => this.map(milestone));
  }

  async adminList() {
    const milestones = await this.prisma.milestone.findMany({
      include: milestoneInclude,
      orderBy: [{ sortOrder: 'asc' }, { date: 'asc' }],
    });
    return milestones.map((milestone) => this.map(milestone));
  }

  async create(dto: UpsertMilestoneDto) {
    await this.assertMediaExists(dto.mediaAssetId);
    const milestone = await this.prisma.milestone.create({
      data: this.toData(dto),
      include: milestoneInclude,
    });
    return this.map(milestone);
  }

  async update(id: string, dto: UpsertMilestoneDto) {
    await this.assertExists(id);
    await this.assertMediaExists(dto.mediaAssetId);
    const milestone = await this.prisma.milestone.update({
      where: { id },
      data: this.toData(dto),
      include: milestoneInclude,
    });
    return this.map(milestone);
  }

  async delete(id: string) {
    await this.assertExists(id);
    await this.prisma.milestone.delete({ where: { id } });
  }

  async reorder(dto: ReorderMilestonesDto) {
    const milestones = await this.prisma.milestone.findMany({ select: { id: true } });
    const actual = new Set(milestones.map((milestone) => milestone.id));
    if (
      dto.milestoneIds.length !== actual.size ||
      new Set(dto.milestoneIds).size !== dto.milestoneIds.length ||
      dto.milestoneIds.some((id) => !actual.has(id))
    ) {
      throw new BadRequestException({
        code: 'INVALID_MILESTONE_ORDER',
        message: 'Order must contain every milestone exactly once.',
      });
    }

    await this.prisma.$transaction(
      dto.milestoneIds.map((id, sortOrder) =>
        this.prisma.milestone.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { updated: dto.milestoneIds.length };
  }

  private map(milestone: MilestoneRecord) {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      date: milestone.date.toISOString(),
      type: milestone.type,
      visible: milestone.visible,
      sortOrder: milestone.sortOrder,
      mediaAsset: this.projects.mapMedia(milestone.mediaAsset),
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString(),
    };
  }

  private toData(dto: UpsertMilestoneDto): Prisma.MilestoneUncheckedCreateInput {
    return {
      title: dto.title.trim(),
      description: dto.description.trim(),
      date: new Date(dto.date),
      type: dto.type.trim(),
      visible: dto.visible,
      sortOrder: dto.sortOrder,
      mediaAssetId: dto.mediaAssetId || null,
    };
  }

  private async assertExists(id: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!milestone) {
      throw new NotFoundException({
        code: 'MILESTONE_NOT_FOUND',
        message: 'Milestone not found.',
      });
    }
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
        message: 'The selected milestone media does not exist.',
        fields: { mediaAssetId: 'Not found' },
      });
    }
  }
}
