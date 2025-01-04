import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  orderType: string;

  @IsNotEmpty()
  @IsString()
  data: string;
}
