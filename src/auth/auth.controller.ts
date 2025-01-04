import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginUserDto } from '../dto/loginUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from '../types/googleUserInterface';
import { PasswordRecoveryDTO } from '../dto/passwordRecovery.dto';
import { CreateRecoveryTokenDTO } from '../dto/createRecoveryToken.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('create-recovery-token')
  async createRecoveryToken(
    @Body() createRecoveryToken: CreateRecoveryTokenDTO,
  ) {
    try {
      return await this.authService.createRecoveryToken(createRecoveryToken);
    } catch (error) {
      this.logger.error('verify-email error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() passwordRecoveryDto: PasswordRecoveryDTO) {
    try {
      return this.authService.recoverPassword(passwordRecoveryDto);
    } catch (error) {
      this.logger.error('create-recovery-token error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('password-recovery-token-verify')
  async verifyPasswordRecovery(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token is missing', 400);
    }

    try {
      return this.authService.passwordRecoveryVerify(token);
    } catch (error) {
      this.logger.error(
        'password-recovery-token-verify error: ',
        error.message,
      );
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('verify-new-email')
  async veryfyNewEmail(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token is missing', 400);
    }

    try {
      return this.authService.verifyNewEmail(token);
    } catch (error) {
      this.logger.error('verify-new-email error: ', error.message);
      throw new HttpException(error.message || error.name, error.status || 500);
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return this.authService.register(createUserDto);
    } catch (error) {
      this.logger.error('Registration error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      return this.authService.login(loginUserDto);
    } catch (error) {
      this.logger.error('Login error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const googleUser: GoogleUser = req.user;

    try {
      const { token } = await this.authService.callbackFromGoogle(googleUser);

      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('google/callback error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
