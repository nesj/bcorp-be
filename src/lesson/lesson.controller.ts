import {
  Controller,
  UseGuards,
  Request,
  Logger,
  HttpException,
  Get,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserRequest } from '../types/extendedExpressRequest';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonController {
  private readonly logger = new Logger(LessonController.name);
  constructor(private readonly lessonService: LessonService) {}

  @Get('/dates')
  async getAllLessonsDates(@Request() req: UserRequest) {
    try {
      return await this.lessonService.getLessonsDates(req);
    } catch (error) {
      this.logger.error('getAllLessonsDates error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('/')
  async getAllLessons(@Request() req: UserRequest) {
    try {
      return await this.lessonService.getLessonsDates(req);
    } catch (error) {
      this.logger.error('getAllLessons error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
