import { IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  countryCode: string;

  @IsString()
  type: 'packs' | 'custom';

  @IsString()
  pack?: 'Starter Pack' | 'Pro Pack' | 'Saver Pack';

  @IsNumber()
  tokens?: number;
}
