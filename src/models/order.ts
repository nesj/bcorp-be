import { User } from './user';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() orderType: string;

  @Column({ default: false }) paid: boolean;

  @Column({ default: null }) data: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user: User) => user.orders)
  user: User;
}
