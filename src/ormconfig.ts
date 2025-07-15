import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './models/user';

dotenv.config();

export const connectionSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_PUBLIC_URL,
  logging: ['error', 'warn'],
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  entities: [User, 'src/models/*.ts', 'src/**/*.entity.ts'],
  extra: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
});
