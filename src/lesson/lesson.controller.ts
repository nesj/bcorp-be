import {
  Controller,
  UseGuards,
  Request,
  Logger,
  HttpException,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserRequest } from '../types/extendedExpressRequest';
import { GetAllWeeklyLessonsDto } from '../dto/getAllWeeklyLessons.dto';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonController {
  private readonly logger = new Logger(LessonController.name);
  constructor(private readonly lessonService: LessonService) {}

  @Post('/week')
  async getAllLessons(
    @Body() getAllWeeklyLessonsDto: GetAllWeeklyLessonsDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.lessonService.getLessons(req, getAllWeeklyLessonsDto);
    } catch (error) {
      this.logger.error('getAllLessons error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('/dates')
  async getAllLessonsDates(@Request() req: UserRequest) {
    try {
      return await this.lessonService.getLessonsDates(req);
    } catch (error) {
      this.logger.error('getAllLessonsDates error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
