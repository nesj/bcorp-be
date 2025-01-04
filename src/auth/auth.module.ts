import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import * as dotenv from 'dotenv';
import { JwtAuthGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '3h' },
    }),
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    GoogleStrategy,
  ],
  exports: [UserService, JwtModule, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
