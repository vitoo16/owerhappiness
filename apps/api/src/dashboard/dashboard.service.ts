import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly projects: ProjectsService) {}
  async get() {
    const [projects, publishedProjects, draftProjects, milestones, playgroundItems, mediaAssets, recent] = await this.prisma.$transaction([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.project.count({ where: { status: 'DRAFT' } }),
      this.prisma.milestone.count(),
      this.prisma.playgroundItem.count(),
      this.prisma.mediaAsset.count(),
      this.prisma.project.findMany({ take: 5, orderBy: { updatedAt: 'desc' }, include: { coverImage: true } }),
    ]);
    return { projects, publishedProjects, draftProjects, milestones, playgroundItems, mediaAssets, recentProjects: recent.map((p) => this.projects.mapProject(p)) };
  }
}
