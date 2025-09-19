import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const UserOne = await prisma.user.upsert({
    where: { email: 'userOne@example.com' },
    update: {},
    create: {
      email: 'userOne@example.com',
      password: hashedPassword,
      name: 'User 1',
    },
  });

  const UserTwo = await prisma.user.upsert({
    where: { email: 'userTwo@example.com' },
    update: {},
    create: {
      email: 'userTwo@example.com',
      password: hashedPassword,
      name: 'User 2',
    },
  });

  const student1 = await prisma.student.upsert({
    where: { email: 'joao.silva@student.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'joao.silva@student.com',
      ra: 'RA123456',
      cpf: '11144477735',
    },
  });

  const student2 = await prisma.student.upsert({
    where: { email: 'maria.santos@student.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'maria.santos@student.com',
      ra: 'RA123457',
      cpf: '22255588846',
    },
  });

  const student3 = await prisma.student.upsert({
    where: { email: 'pedro.oliveira@student.com' },
    update: {},
    create: {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@student.com',
      ra: 'RA123458',
      cpf: '33366699957',
    },
  });

  await prisma.studentUser.upsert({
    where: {
      userId_studentId_action: {
        userId: UserOne.id,
        studentId: student1.id,
        action: 'CREATED',
      },
    },
    update: {},
    create: {
      userId: UserOne.id,
      studentId: student1.id,
      action: 'CREATED',
    },
  });

  await prisma.studentUser.upsert({
    where: {
      userId_studentId_action: {
        userId: UserOne.id,
        studentId: student2.id,
        action: 'CREATED',
      },
    },
    update: {},
    create: {
      userId: UserOne.id,
      studentId: student2.id,
      action: 'CREATED',
    },
  });

  await prisma.studentUser.upsert({
    where: {
      userId_studentId_action: {
        userId: UserTwo.id,
        studentId: student3.id,
        action: 'CREATED',
      },
    },
    update: {},
    create: {
      userId: UserTwo.id,
      studentId: student3.id,
      action: 'CREATED',
    },
  });

  console.log('Database seeding completed');
  console.log(`Created users: ${UserOne.name}, ${UserTwo.name}`);
  console.log(`Created students: ${student1.name}, ${student2.name}, ${student3.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });