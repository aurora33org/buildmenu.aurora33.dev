import { readFileSync } from 'fs';
import { join } from 'path';
import { getDatabase } from '../src/lib/db/schema';

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: tsx scripts/run-migration.ts <migration-file>');
  process.exit(1);
}

try {
  const migrationPath = join(process.cwd(), 'src/lib/db/migrations', migrationFile);
  const sql = readFileSync(migrationPath, 'utf-8');

  const db = getDatabase();

  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n🔄 Running migration: ${migrationFile}`);
  console.log(`📝 Found ${statements.length} statements\n`);

  for (const statement of statements) {
    try {
      db.exec(statement);
      console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
    } catch (error) {
      console.error(`❌ Error executing statement:`);
      console.error(statement);
      console.error(error);
      process.exit(1);
    }
  }

  console.log(`\n✨ Migration completed successfully!\n`);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
