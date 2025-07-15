
import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_PUBLIC_URL,
  entities: ['src/models/*.ts'],
  synchronize: false,
});

async function checkDatabase() {
  try {
    await AppDataSource.initialize();
    
    // Проверить пользователей
    const userRepo = AppDataSource.getRepository('User');
    const users = await userRepo.find();
    console.log('👥 Пользователи в БД:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name} ${user.surname}) - ${user.role}`);
    });
    
    // Проверить другие таблицы
    const orderRepo = AppDataSource.getRepository('Order');
    const orders = await orderRepo.find();
    console.log(`📦 Заказов в БД: ${orders.length}`);
    
    const transactionRepo = AppDataSource.getRepository('Transaction');
    const transactions = await transactionRepo.find();
    console.log(`💳 Транзакций в БД: ${transactions.length}`);
    
    const lessonRepo = AppDataSource.getRepository('Lesson');
    const lessons = await lessonRepo.find();
    console.log(`📚 Уроков в БД: ${lessons.length}`);
    
    await AppDataSource.destroy();
    console.log('✅ Проверка завершена');
  } catch (error) {
    console.error('❌ Ошибка при проверке БД:', error);
  }
}

checkDatabase();