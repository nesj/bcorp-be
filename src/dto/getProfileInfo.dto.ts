import { IsArray, IsString } from 'class-validator';
import { User } from '../models/user';

export class GetProfileInfoDto {
  @IsArray()
  select?: (keyof User)[];

  @IsString()
  email?: string;

  @IsString()
  id?: number;
}
