import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../models/lesson';
import { UserRequest } from '../types/extendedExpressRequest';
import { Repository } from 'typeorm';
import { GetAllWeeklyLessonsDto } from '../dto/getAllWeeklyLessons.dto';
import { LessonStatuses } from '../enums/lessonStatusEnum';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async getLessonsDates(req: UserRequest) {
    const { email, role } = req.user;

    const filter =
      role === 'teacher' ? { teacher: { email } } : { student: { email } };

    const lessons = await this.lessonRepository.find({
      where: { ...filter, status: LessonStatuses.Opened },
      relations: ['teacher', 'student'],
    });

    if (!lessons.length) {
      return {};
    }

    const today = new Date();

    const dayOfWeek = today.getDay();

    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const lessonsByWeek: Record<string, number> = {};

    lessons.forEach((lesson) => {
      const lessonDate = new Date(lesson.startDate);

      if (lessonDate >= startOfWeek) {
        const startOfLessonWeek = new Date(lessonDate);
        const dayOfLessonWeek = startOfLessonWeek.getDay();
        const daysToMondayLesson =
          dayOfLessonWeek === 0 ? 6 : dayOfLessonWeek - 1;
        startOfLessonWeek.setDate(lessonDate.getDate() - daysToMondayLesson);
        startOfLessonWeek.setHours(0, 0, 0, 0);

        const endOfLessonWeek = new Date(startOfLessonWeek);
        endOfLessonWeek.setDate(startOfLessonWeek.getDate() + 6);
        endOfLessonWeek.setHours(23, 59, 59, 999);

        const formatDate = (date: Date) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          return `${day}.${month}`;
        };

        const weekKey = `${formatDate(startOfLessonWeek)} - ${formatDate(endOfLessonWeek)}`;

        lessonsByWeek[weekKey] = (lessonsByWeek[weekKey] || 0) + 1;
      }
    });

    return lessonsByWeek;
  }

  async getLessons(req: UserRequest, dto: GetAllWeeklyLessonsDto) {
    const { email, role } = req.user;
    const filter =
      role === 'teacher' ? { teacher: { email } } : { student: { email } };

    const [startDateStr, endDateStr] = dto.date.split(' - ');
    const [startDay, startMonth] = startDateStr.split('.');
    const [endDay, endMonth] = endDateStr.split('.');

    const startDate = new Date(
      new Date().getFullYear(),
      parseInt(startMonth) - 1,
      parseInt(startDay),
    );
    const endDate = new Date(
      new Date().getFullYear(),
      parseInt(endMonth) - 1,
      parseInt(endDay),
    );

    const lessons = await this.lessonRepository.find({
      where: { ...filter, status: LessonStatuses.Opened },
      relations: ['teacher', 'student'],
    });

    if (!lessons.length) {
      return {};
    }

    const lessonsInRange = lessons.filter((lesson) => {
      const lessonDate = new Date(
        new Date(lesson.startDate).setHours(0, 0, 0, 0),
      ).getTime();
      const start = new Date(
        new Date(startDate).setHours(0, 0, 0, 0),
      ).getTime();
      const end = new Date(new Date(endDate).setHours(0, 0, 0, 0)).getTime();

      return lessonDate >= start && lessonDate <= end;
    });

    const lessonsByDay: Record<string, Record<string, any>> = {};

    lessonsInRange.forEach((lesson) => {
      const lessonDate = new Date(lesson.startDate);
      const dayKey = `day-${lessonDate.getDay() + 1}`;
      const timeKey = `${lessonDate.getHours()}:${String(lessonDate.getMinutes()).padStart(2, '0')}`;

      if (!lessonsByDay[dayKey]) {
        lessonsByDay[dayKey] = {};
      }

      lessonsByDay[dayKey][timeKey] = {
        id: lesson.id,
        Subject: lesson.subject,
        Teacher: lesson.teacher.email,
        Student: lesson.student.email,
      };
    });

    return lessonsByDay;
  }

  async cancelLesson(id: string): Promise<boolean> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: Number(id) },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    lesson.status = LessonStatuses.Cancelled;

    await this.lessonRepository.save(lesson);

    return true;
  }
}
