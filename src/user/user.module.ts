import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user';
import * as dotenv from 'dotenv';
import { Lesson } from '../models/lesson';

dotenv.config();

@Module({
  imports: [TypeOrmModule.forFeature([User, Lesson])],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
