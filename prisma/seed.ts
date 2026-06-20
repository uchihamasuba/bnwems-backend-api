import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Business Manager overseeing operations',
    },
  });

  const leaderRole = await prisma.role.upsert({
    where: { name: 'Leader Staff' },
    update: {},
    create: {
      name: 'Leader Staff',
      description: 'Field operation leader',
    },
  });

  const techRole = await prisma.role.upsert({
    where: { name: 'Technical Staff' },
    update: {},
    create: {
      name: 'Technical Staff',
      description: 'Field technical staff',
    },
  });

  // 2. Create Default Admin User
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: passwordHash,
      fullName: 'System Administrator',
      email: 'admin@bnwems.local',
      roleId: adminRole.id,
      status: 'active',
    },
  });

  console.log('Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
