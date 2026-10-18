import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initializare baza de date SaveBite (Doar cont Admin securizat) ---');

  const adminPasswordHash = await argon2.hash('Admin2026!', {
    type: argon2.argon2id,
  });

  await prisma.user.upsert({
    where: { email: 'admin@savebite.ro' },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@savebite.ro',
      passwordHash: adminPasswordHash,
      name: 'Elena Ionescu (Admin)',
      role: Role.ADMIN,
      phone: '0700 000 001',
      neighborhood: 'Iași Central',
    },
  });

  console.log('--- Initializare completa: 1 singur cont Admin real configurat. Nu exista date fictive. ---');
}

main()
  .catch((e) => {
    console.error('Eroare la seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
