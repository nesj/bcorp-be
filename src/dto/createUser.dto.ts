import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { rolesEnum } from '../enums/rolesEnum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  regType: string;

  @IsString()
  role: rolesEnum;

  @IsString()
  birthDate: string;

  @IsString()
  locale: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  repeatPassword: string;
}
