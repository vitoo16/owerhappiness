import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import {
  AdminPlaygroundController,
  PublicPlaygroundController,
} from './playground.controller';
import { PlaygroundService } from './playground.service';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [PublicPlaygroundController, AdminPlaygroundController],
  providers: [PlaygroundService],
})
export class PlaygroundModule {}
