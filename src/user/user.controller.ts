import {
  Controller,
  UseGuards,
  Request,
  Get,
  Post,
  InternalServerErrorException,
  Logger,
  Body,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserService } from './user.service';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ChangeProfileDto } from '../dto/changeProfile.dto';
import { UserRequest } from '../types/extendedExpressRequest';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req: UserRequest) {
    try {
      const email = req.user.email;
      const user = await this.userService.findByEmail(email);

      delete user.password;

      return user;
    } catch (error) {
      this.logger.error('get profile error: ', error.message);
      throw new InternalServerErrorException('get profile failed');
    }
  }

  @Post('change-password')
  async changeUsersPassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.userService.changePassword(changePasswordDto, req);
    } catch (error) {
      this.logger.error('change-password error: ', error.message);

      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post('change-profile')
  async changeProfile(
    @Body() changeProfileDto: ChangeProfileDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.userService.changeProfile(changeProfileDto, req);
    } catch (error) {
      this.logger.error('change-profile error: ', error.message);

      throw new HttpException(error.message, error.status || 500);
    }
  }
}
