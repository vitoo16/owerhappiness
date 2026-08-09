import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import { OriginGuard } from '../common/guards/origin.guard';
import { ReorderMilestonesDto, UpsertMilestoneDto } from './dto/milestone.dto';
import { MilestonesService } from './milestones.service';

@Controller('milestones')
export class PublicMilestonesController {
  constructor(private readonly milestones: MilestonesService) {}

  @Get()
  list() {
    return this.milestones.publicList();
  }
}

@Controller('admin/milestones')
@UseGuards(AuthGuard, OwnerGuard)
export class AdminMilestonesController {
  constructor(private readonly milestones: MilestonesService) {}

  @Get()
  list() {
    return this.milestones.adminList();
  }

  @Post()
  @UseGuards(OriginGuard)
  create(@Body() dto: UpsertMilestoneDto) {
    return this.milestones.create(dto);
  }

  @Put('order')
  @UseGuards(OriginGuard)
  reorder(@Body() dto: ReorderMilestonesDto) {
    return this.milestones.reorder(dto);
  }

  @Patch(':id')
  @UseGuards(OriginGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertMilestoneDto) {
    return this.milestones.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.milestones.delete(id);
  }
}
