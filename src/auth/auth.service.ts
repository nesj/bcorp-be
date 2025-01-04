import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginUserDto } from '../dto/loginUser.dto';
import { GoogleUser } from '../types/googleUserInterface';
import { User } from '../models/user';
import { UserService } from '../user/user.service';
import * as generator from 'generate-password';
import { PasswordRecoveryDTO } from '../dto/passwordRecovery.dto';
import { CreateRecoveryTokenDTO } from '../dto/createRecoveryToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async createRecoveryToken(
    createRecoveryTokenDto: CreateRecoveryTokenDTO,
  ): Promise<{ success: boolean }> {
    const { email } = createRecoveryTokenDto;

    const existingUser = await this.userService.findByEmail(email, false);

    if (!existingUser) {
      throw new BadRequestException('Email does not exist');
    }

    const token = this.jwtService.sign({ email });

    // for future
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const recoveryUrl = `${process.env.FRONTEND_URL}/auth/password-recovery?token=${token}`;
    console.log('Recovery link: ', recoveryUrl);

    if (token) {
      return { success: true };
    }
  }

  async recoverPassword(
    passwordRecoveryDto: PasswordRecoveryDTO,
  ): Promise<{ success: boolean; token: string }> {
    const result = await this.userService.recoverPassword(passwordRecoveryDto);

    return result;
  }

  async passwordRecoveryVerify(token: string): Promise<{ success: boolean }> {
    let userEmail: string;

    try {
      const { email } = await this.jwtService.verify(token);
      userEmail = email;
    } catch (error) {
      return { success: false };
    }

    const existingUser = await this.userService.findByEmail(userEmail, false);

    return { success: !!existingUser };
  }

  async verifyNewEmail(
    token: string,
  ): Promise<{ success: boolean; token: string; newEmail: string }> {
    const { userId, newEmail } = this.jwtService.verify(token);

    const existingUser = await this.userService.findById(userId);

    existingUser.email = newEmail;
    existingUser.emailVerificationToken = '';
    existingUser.emailVerified = true;

    const saved = await this.userService.saveUser(existingUser);

    if (saved) {
      const token = this.generateJwt(existingUser);

      return { success: true, token: token, newEmail: newEmail };
    }
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    // createUserDto.regType === 'Google' ? 'Google' : 'form';
    const user = await this.userService.register(createUserDto);
    const token = this.generateJwt(user);

    return { user, token };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: User; token: string }> {
    const user = await this.userService.login(loginUserDto);
    const token = this.generateJwt(user);

    return { user, token };
  }

  async callbackFromGoogle(googleUser: GoogleUser): Promise<{ token: string }> {
    const existingUser = await this.userService.findByEmail(
      googleUser.email,
      false,
    );

    if (!existingUser) {
      const password = generator.generate({
        length: 12,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
        excludeSimilarCharacters: true,
      });

      const createUserDto: CreateUserDto = {
        email: googleUser.email,
        name: googleUser.firstName,
        surname: '',
        regType: 'Google',
        password: password,
        repeatPassword: password,
      };

      const { token } = await this.register(createUserDto);

      return { token };
    } else {
      const token = this.generateJwt(existingUser);

      return { token };
    }
  }

  generateJwt(user: User): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      tokens: user.tokens,
      emailVerified: user.emailVerified,
    });
  }
}
