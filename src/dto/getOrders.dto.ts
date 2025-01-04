import { IsNumber } from 'class-validator';

export class GetOrdersDto {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}
