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
import { ReorderPlaygroundDto, UpsertPlaygroundDto } from './dto/playground.dto';
import { PlaygroundService } from './playground.service';

@Controller('playground')
export class PublicPlaygroundController {
  constructor(private readonly playground: PlaygroundService) {}

  @Get()
  list() {
    return this.playground.publicList();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.playground.publicBySlug(slug);
  }
}

@Controller('admin/playground')
@UseGuards(AuthGuard, OwnerGuard)
export class AdminPlaygroundController {
  constructor(private readonly playground: PlaygroundService) {}

  @Get()
  list() {
    return this.playground.adminList();
  }

  @Post()
  @UseGuards(OriginGuard)
  create(@Body() dto: UpsertPlaygroundDto) {
    return this.playground.create(dto);
  }

  @Put('order')
  @UseGuards(OriginGuard)
  reorder(@Body() dto: ReorderPlaygroundDto) {
    return this.playground.reorder(dto);
  }

  @Patch(':id')
  @UseGuards(OriginGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertPlaygroundDto) {
    return this.playground.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.playground.delete(id);
  }
}
