import { initializeDatabase } from '../src/lib/db/schema';

console.log('🔄 Initializing database...\n');

try {
  initializeDatabase();
  console.log('\n✨ Database initialized successfully!\n');
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}
