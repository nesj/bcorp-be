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
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserService } from './user.service';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ChangeProfileDto } from '../dto/changeProfile.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import { UpdateProfileDto } from '../dto/updateProfile.dto';
import { GetProfileInfoDto } from '../dto/getProfileInfo.dto';

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

  // get user by id
  @Get(':id')
  async getUserById(@Request() req: UserRequest, @Param('id') id: string) {
    try {
      const userId = Number(id);
      
      return await this.userService.findById(userId, req);
    } catch (error) {
      this.logger.error('get-user-by-id error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
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

  @Post('update-profile')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.userService.updateProfile(updateProfileDto, req);
    } catch (error) {
      this.logger.error('update-profile error: ', error.message);

      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post('get-profile-info')
  async getProfileInfo(@Body() getProfileInfoDto: GetProfileInfoDto) {
    try {
      return await this.userService.getProfileInfo(getProfileInfoDto);
    } catch (error) {
      this.logger.error('update-profile error: ', error.message);

      throw new HttpException(error.message, error.status || 500);
    }
  }
}
