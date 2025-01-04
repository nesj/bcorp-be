import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from './transaction';

@Entity('webhook')
export class SiquroWebhook {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => Transaction,
    (transaction: Transaction) => transaction.webhooks,
  )
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  status: string;

  @Column({ default: false }) webhookVerified: boolean;
}
