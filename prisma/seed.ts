import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if super admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'super_admin' },
  });

  if (existingAdmin) {
    console.log('✅ Super admin already exists:', existingAdmin.email);
  } else {
    // Create super admin
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@menu.local';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
      },
    });

    console.log('✅ Created super admin:', admin.email);
  }

  // Check if tags exist
  const existingTags = await prisma.tag.count();

  if (existingTags > 0) {
    console.log(`✅ ${existingTags} tags already exist`);
  } else {
    // Create 8 default tags
    const tags = [
      { name: 'vegetarian', displayName: 'Vegetariano', icon: '🥗', color: '#22c55e' },
      { name: 'vegan', displayName: 'Vegano', icon: '🌱', color: '#16a34a' },
      { name: 'gluten-free', displayName: 'Sin Gluten', icon: '🌾', color: '#eab308' },
      { name: 'dairy-free', displayName: 'Sin Lácteos', icon: '🥛', color: '#06b6d4' },
      { name: 'spicy', displayName: 'Picante', icon: '🌶️', color: '#ef4444' },
      { name: 'nuts', displayName: 'Contiene Nueces', icon: '🥜', color: '#f59e0b' },
      { name: 'seafood', displayName: 'Mariscos', icon: '🦐', color: '#3b82f6' },
      { name: 'organic', displayName: 'Orgánico', icon: '♻️', color: '#10b981' },
    ];

    await prisma.tag.createMany({ data: tags });

    console.log(`✅ Created ${tags.length} tags`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
