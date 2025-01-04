import { User } from './user';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SiquroWebhook } from './siquroWebhook';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json', { default: null }) originalRequest: string;

  @Column()
  siquroId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: null }) status: string;

  @Column('decimal', { precision: 13, scale: 2, default: 0, nullable: false })
  amount: number;

  @Column() tokens: number;

  @OneToMany(
    () => SiquroWebhook,
    (webhook: SiquroWebhook) => webhook.transaction,
  )
  webhooks: SiquroWebhook[];

  @ManyToOne(() => User, (user: User) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
