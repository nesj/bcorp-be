import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from '../models/lesson';
import { UserRequest } from '../types/extendedExpressRequest';
import { Repository } from 'typeorm';

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
      where: filter,
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

        const weekKey = `${startOfLessonWeek.toLocaleDateString()} - ${endOfLessonWeek.toLocaleDateString()}`;

        lessonsByWeek[weekKey] = (lessonsByWeek[weekKey] || 0) + 1;
      }
    });

    return lessonsByWeek;
  }
}
