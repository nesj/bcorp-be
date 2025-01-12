import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from 'src/order/order.module';
import { SiquroModule } from '../siquro/siquro.module';
import { join } from 'path';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number.parseInt(process.env.DATABASE_PORT) || 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      entities: [
        join(__dirname, '**', '*.entity.{ts,js}'),
        join(__dirname, 'models', '*.ts'),
      ],
      autoLoadEntities: process.env.NODE_ENV === 'development' ? true : false,
      migrations: ['src/migrations/*.{ts}'],
      migrationsTableName: 'migrations',
    }),
    UserModule,
    AuthModule,
    OrderModule,
    SiquroModule,
    LessonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
