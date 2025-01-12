import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { rolesEnum } from '../enums/rolesEnum';
import { Order } from './order';
import { Transaction } from './transaction';
import { Lesson } from './lesson';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column() password: string;

  @Column({ type: 'text', nullable: true, default: null })
  descr: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  avatar: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  smallAvatar: string | null;

  @Column({ default: '' }) emailVerificationToken: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ default: 'form' }) registrationType: string;

  @Column({ default: null }) name: string;

  @Column({ default: null }) surname: string;

  @Column({ default: 0 }) tokens: number;

  @Column({ default: false }) emailVerified: boolean;

  @Column({ default: rolesEnum.STUDENT }) role: rolesEnum;

  @OneToMany(() => Order, (order: Order) => order.user)
  orders: Order[];

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Lesson, (lesson) => lesson.teacher)
  teacherLessons: Lesson[];

  @OneToMany(() => Lesson, (lesson) => lesson.student)
  studentLessons: Lesson[];
}
