import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ProjectStatus } from '@portfolio/contracts';

export class UpsertPlaygroundDto {
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(320)
  summary!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  type!: string;

  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status!: ProjectStatus;

  @IsObject()
  content!: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  thumbnailId?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  liveUrl?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  sourceUrl?: string | null;

  @Type(() => Number)
  @IsInt()
  sortOrder!: number;
}

export class ReorderPlaygroundDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  playgroundIds!: string[];
}
