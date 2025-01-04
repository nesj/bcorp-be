import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { rolesEnum } from '../enums/rolesEnum';
import { Order } from './order';
import { Transaction } from './transaction';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column() password: string;

  @Column({ default: '' }) emailVerificationToken: string;

  @Column({ default: 'form' }) registrationType: string;

  @Column({ default: null }) name: string;

  @Column({ default: null }) surname: string;

  @Column({ default: 0 }) tokens: number;

  @Column({ default: false }) emailVerified: boolean;

  @Column({ default: rolesEnum.USER }) role: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.user)
  transactions: Transaction[];
}
