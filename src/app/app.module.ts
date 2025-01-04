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

@Module({
  imports: [
    UserModule,
    AuthModule,
    OrderModule,
    SiquroModule,
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
      autoLoadEntities: true,
      migrations: ['src/migrations/*.{ts}'],
      migrationsTableName: 'migrations',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
