import Database from 'better-sqlite3';
import path from 'path';

// Database connection singleton
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/menu.db';
    const fullPath = path.resolve(process.cwd(), dbPath);

    // Ensure data directory exists
    const fs = require('fs');
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(fullPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }

  return db;
}

// Database schema initialization
export function initializeDatabase() {
  const db = getDatabase();

  // Users table (super_admin + tenant_users)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tenant_user' CHECK(role IN ('super_admin', 'tenant_user')),
      restaurant_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
    );
  `);

  // Restaurants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      address TEXT,
      timezone TEXT DEFAULT 'America/Mexico_City',
      currency TEXT DEFAULT 'MXN',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Restaurant settings (theme customization)
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurant_settings (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT UNIQUE NOT NULL,
      template_id TEXT NOT NULL DEFAULT 'classic' CHECK(template_id IN ('classic', 'modern', 'elegant', 'minimal')),
      primary_color TEXT DEFAULT '#000000',
      secondary_color TEXT DEFAULT '#666666',
      accent_color TEXT DEFAULT '#ff6b6b',
      background_color TEXT DEFAULT '#ffffff',
      text_color TEXT DEFAULT '#000000',
      font_heading TEXT DEFAULT 'Inter',
      font_body TEXT DEFAULT 'Inter',
      custom_css TEXT,
      show_prices BOOLEAN DEFAULT 1,
      show_descriptions BOOLEAN DEFAULT 1,
      show_allergens BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
  `);

  // Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
  `);

  // Menu items
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      base_price REAL,
      display_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT 1,
      is_featured BOOLEAN DEFAULT 0,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
  `);

  // Price variants (e.g., Small/Medium/Large)
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_variants (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    );
  `);

  // Item variants (customizations)
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_variants (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price_modifier REAL DEFAULT 0.0,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    );
  `);

  // Tags (dietary/allergen info)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      icon TEXT,
      color TEXT DEFAULT '#gray',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Item tags junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_tags (
      item_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // Availability schedules
  db.exec(`
    CREATE TABLE IF NOT EXISTS availability_schedules (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      category_id TEXT,
      day_of_week INTEGER CHECK(day_of_week >= 0 AND day_of_week <= 6),
      start_time TEXT,
      end_time TEXT,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      CHECK ((item_id IS NOT NULL AND category_id IS NULL) OR (item_id IS NULL AND category_id IS NOT NULL))
    );
  `);

  // Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Menu views analytics
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_views (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      ip_address TEXT,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
    CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_restaurant ON users(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_items_category ON menu_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_items_restaurant ON menu_items(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_views_restaurant ON menu_views(restaurant_id);
  `);

  console.log('✅ Database schema initialized successfully');
}

// Type definitions for database models
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'super_admin' | 'tenant_user';
  restaurant_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RestaurantSettings {
  id: string;
  restaurant_id: string;
  template_id: 'classic' | 'modern' | 'elegant' | 'minimal';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
  custom_css: string | null;
  show_prices: boolean;
  show_descriptions: boolean;
  show_allergens: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
  icon: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MenuItem {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PriceVariant {
  id: string;
  item_id: string;
  name: string;
  price: number;
  display_order: number;
  is_default: boolean;
  created_at: string;
}

export interface ItemVariant {
  id: string;
  item_id: string;
  name: string;
  price_modifier: number;
  display_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  display_name: string;
  icon: string | null;
  color: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
