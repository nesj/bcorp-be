import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Можно включить CORS, если нужно
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // или указать домены через запятую
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Прочие настройки безопасности или глобальные пайпы, фильтры и т.д. можно добавить здесь

  const port = parseInt(process.env.APP_PORT, 10) || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
