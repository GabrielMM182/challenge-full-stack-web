import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin User',
      role: 'SUPER_ADMIN',
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
        userId: adminUser.id,
        studentId: student1.id,
        action: 'CREATED',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      studentId: student1.id,
      action: 'CREATED',
    },
  });

  await prisma.studentUser.upsert({
    where: {
      userId_studentId_action: {
        userId: adminUser.id,
        studentId: student2.id,
        action: 'CREATED',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      studentId: student2.id,
      action: 'CREATED',
    },
  });

  await prisma.studentUser.upsert({
    where: {
      userId_studentId_action: {
        userId: superAdminUser.id,
        studentId: student3.id,
        action: 'CREATED',
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      studentId: student3.id,
      action: 'CREATED',
    },
  });

  console.log('Database seeding completed');
  console.log(`Created users: ${adminUser.name}, ${superAdminUser.name}`);
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