import { IsEmail } from 'class-validator';

export class CreateRecoveryTokenDTO {
  @IsEmail()
  email: string;
}
