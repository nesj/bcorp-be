import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user';
import { LessonStatuses } from '../enums/lessonStatusEnum';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  subject: string;

  @Column({ default: LessonStatuses.Opened })
  status: LessonStatuses;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  gradeFromTeacher: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  gradeFromStudent: number;

  @ManyToOne(() => User, (user) => user.teacherLessons, { nullable: false })
  teacher: User;

  @ManyToOne(() => User, (user) => user.studentLessons, { nullable: false })
  student: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: false })
  startDate: Date;
}
