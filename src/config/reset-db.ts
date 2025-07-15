import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as readline from 'readline';

const AppDataSource = new DataSource({
 type: 'mysql',
 url: process.env.DATABASE_PUBLIC_URL,
 entities: ['src/models/*.ts'],
 synchronize: true,
 dropSchema: true,
});

function askQuestion(question: string): Promise<string> {
 const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
 });

 return new Promise((resolve) => {
   rl.question(question, (answer) => {
     rl.close();
     resolve(answer);
   });
 });
}

async function resetDatabase() {
 try {
   console.log('⚠️  ВНИМАНИЕ: Это действие удалит ВСЕ данные из базы данных!');
   console.log('🗄️  База данных:', process.env.DATABASE_PUBLIC_URL?.split('@')[1]?.split('/')[0]);
   
   const answer = await askQuestion('Вы уверены, что хотите продолжить? (y/n): ');
   
   if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
     console.log('🔄 Очистка базы данных...');
     await AppDataSource.initialize();
     console.log('✅ База данных полностью очищена и пересоздана');
     await AppDataSource.destroy();
   } else {
     console.log('❌ Операция отменена');
   }
 } catch (error) {
   console.error('❌ Ошибка при очистке БД:', error);
   process.exit(1);
 }
}

resetDatabase();
