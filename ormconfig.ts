import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const connectionSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  logging: ['error', 'warn'],
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  entities: ['src/models/*.ts', 'src/**/*.entity.ts'],
});
