const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'data/menu.db');
const db = new Database(dbPath);

console.log('All tables in database:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

console.log('\nChecking restaurant_settings table schema:');
const schema = db.prepare("PRAGMA table_info(restaurant_settings)").all();
console.log(JSON.stringify(schema, null, 2));

db.close();
