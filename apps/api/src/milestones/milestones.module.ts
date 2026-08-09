import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import {
  AdminMilestonesController,
  PublicMilestonesController,
} from './milestones.controller';
import { MilestonesService } from './milestones.service';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [PublicMilestonesController, AdminMilestonesController],
  providers: [MilestonesService],
})
export class MilestonesModule {}
