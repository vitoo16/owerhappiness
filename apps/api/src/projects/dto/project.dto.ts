import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { ProjectStatus, ProjectType } from '@portfolio/contracts';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(320)
  summary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  description?: string | null;

  @IsIn(['DEVELOPMENT', 'DESIGN', 'HYBRID'])
  type!: ProjectType;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: ProjectStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2200)
  year!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  role!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  client?: string | null;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  technologies!: string[];

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  services!: string[];

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  githubUrl?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  liveUrl?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  behanceUrl?: string | null;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  externalUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  coverImageId?: string | null;

  @IsOptional()
  @IsBoolean()
  coverOmitted?: boolean;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(['DEVELOPMENT', 'DESIGN', 'HYBRID'])
  type?: ProjectType;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: ProjectStatus;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

export class CreateBlockDto {
  @IsIn(['HEADING', 'PARAGRAPH', 'IMAGE', 'IMAGE_GROUP', 'QUOTE', 'VIDEO', 'CODE', 'TECH_CALLOUT'])
  type!: string;

  @Allow()
  content!: unknown;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateBlockDto extends CreateBlockDto {}

export class ReorderBlocksDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID(undefined, { each: true })
  blockIds!: string[];
}

export class ReorderProjectsDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  projectIds!: string[];
}

export class UpdateProjectMediaDto {
  @IsArray()
  @ArrayMaxSize(30)
  @IsUUID(undefined, { each: true })
  mediaAssetIds!: string[];
}
