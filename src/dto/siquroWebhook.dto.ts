import { IsObject, IsString } from 'class-validator';

export class SiquroWebhookDto {
  @IsObject()
  originalRequest: object;

  @IsString()
  txId: string;

  @IsString()
  amount: string;

  @IsString()
  status: string;

  @IsString()
  compoundState: string;

  @IsString()
  createdAt: string;
}
