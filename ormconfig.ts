import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const connectionSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_PUBLIC_URL,
  logging: ['error', 'warn'],
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  entities: ['src/models/*.ts', 'src/**/*.entity.ts'],
  extra: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
});
