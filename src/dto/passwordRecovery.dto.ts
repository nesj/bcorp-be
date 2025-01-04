import { IsNotEmpty, MinLength } from 'class-validator';

export class PasswordRecoveryDTO {
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  repeatNewPassword: string;

  @IsNotEmpty()
  token: string;
}
