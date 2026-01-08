const Database = require('better-sqlite3');
const db = new Database('./data/menu.db');

console.log('Checking users table...');
const users = db.prepare('SELECT id, email, role, restaurant_id FROM users').all();
console.log('Users:', JSON.stringify(users, null, 2));

db.close();
