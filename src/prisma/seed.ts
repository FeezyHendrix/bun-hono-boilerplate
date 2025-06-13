import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      fullName: 'Admin User',
      password: await Bun.password.hash('admin123'),
      role: 'admin',
      isVerified: true,
    },
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      fullName: 'Regular User',
      password: await Bun.password.hash('user123'),
      role: 'user',
      isVerified: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin user: admin@example.com (password: admin123)');
  console.log('📧 Regular user: user@example.com (password: user123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });