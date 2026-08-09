import { IsString, MaxLength } from 'class-validator';

export class UpdateMediaDto {
  @IsString()
  @MaxLength(500)
  altText!: string;
}
