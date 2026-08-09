import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
@Module({ imports: [AuthModule, ProjectsModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
