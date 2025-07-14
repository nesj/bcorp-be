import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../order/order.module';
import { SiquroModule } from '../siquro/siquro.module';
import { join } from 'path';
import { LessonModule } from '../lesson/lesson.module';
import { TeacherModule } from '../teacher/teacher.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_PUBLIC_URL,
      entities: [
        join(__dirname, '**', '*.entity.{ts,js}'),
        join(__dirname, 'models', '*.ts'),
      ],
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsTableName: 'migrations',
      extra: {
        ssl: process.env.NODE_ENV === 'production' ? { 
          rejectUnauthorized: false 
        } : false
      }
    }),
    UserModule,
    AuthModule,
    OrderModule,
    SiquroModule,
    LessonModule,
    TeacherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
