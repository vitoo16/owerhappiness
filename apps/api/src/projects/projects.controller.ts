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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import { OriginGuard } from '../common/guards/origin.guard';
import { ApiPayload } from '../common/interceptors/api-envelope.interceptor';
import {
  CreateBlockDto,
  CreateProjectDto,
  ProjectQueryDto,
  ReorderBlocksDto,
  ReorderProjectsDto,
  UpdateBlockDto,
  UpdateProjectDto,
  UpdateProjectMediaDto,
} from './dto/project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class PublicProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list(@Query() query: ProjectQueryDto) {
    const result = await this.projects.publicList(query);
    return new ApiPayload(result.items, result.meta);
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.projects.publicBySlug(slug);
  }
}

@Controller('admin/projects')
@UseGuards(AuthGuard, OwnerGuard)
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  async list(@Query() query: ProjectQueryDto) {
    const result = await this.projects.adminList(query);
    return new ApiPayload(result.items, result.meta);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.adminById(id);
  }

  @Post()
  @UseGuards(OriginGuard)
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Put('order')
  @UseGuards(OriginGuard)
  reorder(@Body() dto: ReorderProjectsDto) {
    return this.projects.reorder(dto);
  }

  @Patch(':id')
  @UseGuards(OriginGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.delete(id);
  }

  @Post(':id/publish')
  @UseGuards(OriginGuard)
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(OriginGuard)
  unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.unpublish(id);
  }

  @Post(':id/archive')
  @UseGuards(OriginGuard)
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.archive(id);
  }

  @Put(':id/media')
  @UseGuards(OriginGuard)
  updateMedia(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectMediaDto) {
    return this.projects.updateGallery(id, dto);
  }

  @Post(':id/blocks')
  @UseGuards(OriginGuard)
  addBlock(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateBlockDto) {
    return this.projects.addBlock(id, dto);
  }

  @Patch(':id/blocks/:blockId')
  @UseGuards(OriginGuard)
  updateBlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('blockId', ParseUUIDPipe) blockId: string,
    @Body() dto: UpdateBlockDto,
  ) {
    return this.projects.updateBlock(id, blockId, dto);
  }

  @Delete(':id/blocks/:blockId')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlock(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('blockId', ParseUUIDPipe) blockId: string,
  ) {
    return this.projects.deleteBlock(id, blockId);
  }

  @Put(':id/blocks/order')
  @UseGuards(OriginGuard)
  reorderBlocks(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReorderBlocksDto) {
    return this.projects.reorderBlocks(id, dto);
  }
}
