import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { rolesEnum } from '../enums/rolesEnum';
import { connectionSource } from '../ormconfig'; // путь зависит от того, где лежит файл
import { User } from '../models/user';

async function seed() {
  try {
    await connectionSource.initialize();
    const userRepo = connectionSource.getRepository(User);

    const teacherExists = await userRepo.findOneBy({ email: 'teacher@example.com' });
    const studentExists = await userRepo.findOneBy({ email: 'student@example.com' });

    if (!teacherExists) {
      const hashedPasswordTeacher = await bcrypt.hash('teacher123', 10);
      const teacher = userRepo.create({
        email: 'teacher@example.com',
        password: hashedPasswordTeacher,
        name: 'John',
        surname: 'Doe',
        role: rolesEnum.TEACHER,
        emailVerified: true,
        registrationType: 'form',
        tokens: 0,
      });
      await userRepo.save(teacher);
      console.log('✅ Teacher user created');
    } else {
      console.log('ℹ️ Teacher user already exists');
    }

    if (!studentExists) {
      const hashedPasswordStudent = await bcrypt.hash('student123', 10);
      const student = userRepo.create({
        email: 'student@example.com',
        password: hashedPasswordStudent,
        name: 'Jane',
        surname: 'Smith',
        role: rolesEnum.STUDENT,
        emailVerified: true,
        registrationType: 'form',
        tokens: 0,
      });
      await userRepo.save(student);
      console.log('✅ Student user created');
    } else {
      console.log('ℹ️ Student user already exists');
    }

    await connectionSource.destroy();
    console.log('✅ Seeding complete');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    await connectionSource.destroy();
  }
}

seed();
