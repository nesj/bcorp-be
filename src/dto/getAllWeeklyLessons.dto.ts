import { IsString } from 'class-validator';

export class GetAllWeeklyLessonsDto {
  @IsString()
  date: string;
}
