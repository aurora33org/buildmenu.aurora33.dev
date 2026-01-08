import { getDatabase, initializeDatabase } from './schema';
import { hashPassword } from '../auth/password';
import { randomUUID } from 'crypto';

export async function seedDatabase() {
  const db = getDatabase();

  // Initialize schema first
  initializeDatabase();

  // Check if super admin already exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('super_admin');

  if (existingAdmin) {
    console.log('✅ Super admin already exists, skipping seed');
    return;
  }

  console.log('🌱 Seeding database...');

  // Create super admin
  const superAdminId = randomUUID();
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@menu.local';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hashPassword(superAdminPassword);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, restaurant_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    superAdminId,
    superAdminEmail,
    hashedPassword,
    'Super Admin',
    'super_admin',
    null
  );

  console.log(`✅ Super admin created: ${superAdminEmail}`);

  // Seed default tags
  const tags = [
    { id: randomUUID(), name: 'vegetarian', display_name: 'Vegetariano', icon: '🥗', color: '#22c55e' },
    { id: randomUUID(), name: 'vegan', display_name: 'Vegano', icon: '🌱', color: '#16a34a' },
    { id: randomUUID(), name: 'gluten-free', display_name: 'Sin Gluten', icon: '🌾', color: '#eab308' },
    { id: randomUUID(), name: 'dairy-free', display_name: 'Sin Lácteos', icon: '🥛', color: '#06b6d4' },
    { id: randomUUID(), name: 'spicy', display_name: 'Picante', icon: '🌶️', color: '#ef4444' },
    { id: randomUUID(), name: 'nuts', display_name: 'Contiene Nueces', icon: '🥜', color: '#f59e0b' },
    { id: randomUUID(), name: 'seafood', display_name: 'Mariscos', icon: '🦐', color: '#3b82f6' },
    { id: randomUUID(), name: 'organic', display_name: 'Orgánico', icon: '♻️', color: '#10b981' },
  ];

  const insertTag = db.prepare(`
    INSERT INTO tags (id, name, display_name, icon, color)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const tag of tags) {
    insertTag.run(tag.id, tag.name, tag.display_name, tag.icon, tag.color);
  }

  console.log(`✅ ${tags.length} default tags created`);

  console.log('🌱 Database seeded successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log(`Email: ${superAdminEmail}`);
  console.log(`Password: ${superAdminPassword}`);
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error seeding database:', error);
      process.exit(1);
    });
}
