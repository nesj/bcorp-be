import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user';
import { UserService } from '../user/user.service';
import { Order } from '../models/order';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User, Order])],
  providers: [OrderService, UserService, JwtService],
  controllers: [OrderController],
  exports: [TypeOrmModule, OrderService],
})
export class OrderModule {}
