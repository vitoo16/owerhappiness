import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UpsertMilestoneDto } from './dto/milestone.dto';

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
    const milestone = await this.prisma.milestone.create({
      data: this.toData(dto),
      include: milestoneInclude,
    });
    return this.map(milestone);
  }

  async update(id: string, dto: UpsertMilestoneDto) {
    await this.assertExists(id);
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
}
