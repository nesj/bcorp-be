import { IsString } from 'class-validator';

export class ChangeProfileDto {
  @IsString()
  newName: string;

  @IsString()
  newSurname: string;

  @IsString()
  newEmail: string;
}
