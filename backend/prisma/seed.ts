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

  const student4 = await prisma.student.upsert({
    where: { email: 'ana.costa@student.com' },
    update: {},
    create: {
      name: 'Ana Costa',
      email: 'ana.costa@student.com',
      ra: 'RA123459',
      cpf: '44477700068',
    },
  });

  const student5 = await prisma.student.upsert({
    where: { email: 'carlos.ferreira@student.com' },
    update: {},
    create: {
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@student.com',
      ra: 'RA123460',
      cpf: '55588811179',
    },
  });

  const student6 = await prisma.student.upsert({
    where: { email: 'lucia.almeida@student.com' },
    update: {},
    create: {
      name: 'Lúcia Almeida',
      email: 'lucia.almeida@student.com',
      ra: 'RA123461',
      cpf: '66699922280',
    },
  });

  const student7 = await prisma.student.upsert({
    where: { email: 'rafael.souza@student.com' },
    update: {},
    create: {
      name: 'Rafael Souza',
      email: 'rafael.souza@student.com',
      ra: 'RA123462',
      cpf: '77700033391',
    },
  });

  const student8 = await prisma.student.upsert({
    where: { email: 'fernanda.lima@student.com' },
    update: {},
    create: {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@student.com',
      ra: 'RA123463',
      cpf: '88811144402',
    },
  });

  const student9 = await prisma.student.upsert({
    where: { email: 'bruno.martins@student.com' },
    update: {},
    create: {
      name: 'Bruno Martins',
      email: 'bruno.martins@student.com',
      ra: 'RA123464',
      cpf: '99922255513',
    },
  });

  const student10 = await prisma.student.upsert({
    where: { email: 'camila.rocha@student.com' },
    update: {},
    create: {
      name: 'Camila Rocha',
      email: 'camila.rocha@student.com',
      ra: 'RA123465',
      cpf: '10033366624',
    },
  });

  const student11 = await prisma.student.upsert({
    where: { email: 'diego.barbosa@student.com' },
    update: {},
    create: {
      name: 'Diego Barbosa',
      email: 'diego.barbosa@student.com',
      ra: 'RA123466',
      cpf: '39264628096',
    },
  });

  const student12 = await prisma.student.upsert({
    where: { email: 'juliana.pereira@student.com' },
    update: {},
    create: {
      name: 'Juliana Pereira',
      email: 'juliana.pereira@student.com',
      ra: 'RA123467',
      cpf: '40692767002',
    },
  });

  const student13 = await prisma.student.upsert({
    where: { email: 'gustavo.cardoso@student.com' },
    update: {},
    create: {
      name: 'Gustavo Cardoso',
      email: 'gustavo.cardoso@student.com',
      ra: 'RA123468',
      cpf: '13366699957',
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
  console.log(`Created students: ${student1.name}, ${student2.name}, ${student3.name}, ${student4.name}, ${student5.name}, ${student6.name}, ${student7.name}, ${student8.name}, ${student9.name}, ${student10.name}, ${student11.name}, ${student12.name}, ${student13.name}`);
}

main()
  .catch((e) => {
    console.error(' Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });