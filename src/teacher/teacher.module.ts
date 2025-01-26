import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { UserModule } from '../user/user.module';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [UserModule, LessonModule],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
