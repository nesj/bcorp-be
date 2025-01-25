import { IsString } from 'class-validator';

export class CreateNewSubjectDto {
  @IsString()
  subject: string;
}
