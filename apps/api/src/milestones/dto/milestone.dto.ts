import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
export class UpsertMilestoneDto {
 @IsString() @MinLength(1) @MaxLength(180) title!:string;
 @IsString() @MinLength(1) @MaxLength(10000) description!:string;
 @IsDateString() date!:string;
 @IsString() @MinLength(1) @MaxLength(80) type!:string;
 @IsBoolean() visible!:boolean;
 @Type(()=>Number) @IsInt() sortOrder!:number;
 @IsOptional() @IsUUID() mediaAssetId?:string|null;
}
