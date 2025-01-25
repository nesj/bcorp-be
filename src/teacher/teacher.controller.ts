import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TeachersRoleInterceptor } from '../interceptors/teacher';
import { CreateNewSubjectDto } from '../dto/createNewSubject.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import { rolesEnum } from 'src/enums/rolesEnum';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TeachersRoleInterceptor([rolesEnum.TEACHER]))
export class TeacherController {
  private readonly logger = new Logger(TeacherController.name);

  constructor(private readonly teacherService: TeacherService) {}

  @Post('/subject')
  async createNewSubject(
    @Body() createSubjectDTO: CreateNewSubjectDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.teacherService.createNewSubject(createSubjectDTO, req);
    } catch (error) {
      this.logger.error('post createNewSubject error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('/subjects')
  async getSubjects(@Request() req: UserRequest) {
    try {
      return await this.teacherService.getSubjects(req);
    } catch (error) {
      this.logger.error('get subjects error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Delete('/subject/:subject')
  async deleteSubject(
    @Request() req: UserRequest,
    @Param('subject') subject: string,
  ) {
    try {
      return await this.teacherService.deleteSubject(req, subject);
    } catch (error) {
      this.logger.error('get subjects error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
