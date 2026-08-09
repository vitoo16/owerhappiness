import { Allow, IsDefined } from 'class-validator';

export class UpdateUtilityDataDto {
  @IsDefined()
  @Allow()
  value!: unknown;
}
