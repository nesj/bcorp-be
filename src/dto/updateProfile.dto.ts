import { IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsArray()
  fields: string[];

  @IsArray()
  values: Array<string | number>;
}
