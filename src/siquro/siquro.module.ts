import { Module } from '@nestjs/common';
import { SiquroService } from './siquro.service';
import { SiquroController } from './siquro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user';
import { UserService } from '../user/user.service';
import { Transaction } from '../models/transaction';
import { HttpModule } from '@nestjs/axios';
import { SiquroWebhook } from 'src/models/siquroWebhook';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, SiquroWebhook]),
    HttpModule,
  ],
  providers: [SiquroService, UserService],
  controllers: [SiquroController],
  exports: [SiquroService],
})
export class SiquroModule {}
