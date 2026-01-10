import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDatabase } from '@/lib/db/schema';
import { ClassicTemplate } from '@/components/public/templates/ClassicTemplate';
import { ModernTemplate } from '@/components/public/templates/ModernTemplate';
import { MinimalTemplate } from '@/components/public/templates/MinimalTemplate';
import { trackBandwidth } from '@/lib/analytics/bandwidth';

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
}

interface CategoryWithItems extends Category {
  items: MenuItem[];
}

interface RestaurantSettings {
  template_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  font_heading: string | null;
  font_body: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

// Enable ISR - revalidate every hour
export const revalidate = 3600;

// Generate static params for known slugs
export async function generateStaticParams() {
  const db = getDatabase();

  const restaurants = db.prepare(`
    SELECT slug FROM restaurants WHERE deleted_at IS NULL
  `).all() as { slug: string }[];

  return restaurants.map((restaurant) => ({
    slug: restaurant.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getDatabase();

  const restaurant = db.prepare(`
    SELECT name, slug FROM restaurants WHERE slug = ? AND deleted_at IS NULL
  `).get(slug) as { name: string; slug: string } | undefined;

  if (!restaurant) {
    return {
      title: 'Restaurante no encontrado',
    };
  }

  return {
    title: `${restaurant.name} - Menú Digital`,
    description: `Consulta el menú completo de ${restaurant.name}. Platillos, precios y más.`,
    openGraph: {
      title: `${restaurant.name} - Menú Digital`,
      description: `Consulta el menú completo de ${restaurant.name}`,
      type: 'website',
    },
  };
}

async function getMenuData(slug: string) {
  const db = getDatabase();

  // Get restaurant
  const restaurant = db.prepare(`
    SELECT id, name, slug
    FROM restaurants
    WHERE slug = ? AND deleted_at IS NULL
  `).get(slug) as Restaurant | undefined;

  if (!restaurant) {
    return null;
  }

  // Get restaurant settings
  const settings = db.prepare(`
    SELECT * FROM restaurant_settings
    WHERE restaurant_id = ?
  `).get(restaurant.id) as RestaurantSettings;

  // Get categories
  const categories = db.prepare(`
    SELECT id, name, description, display_order, is_visible
    FROM categories
    WHERE restaurant_id = ? AND deleted_at IS NULL
    ORDER BY display_order ASC, created_at ASC
  `).all(restaurant.id) as Category[];

  // Get all menu items
  const items = db.prepare(`
    SELECT
      id,
      category_id,
      name,
      description,
      base_price,
      display_order,
      is_visible,
      is_featured
    FROM menu_items
    WHERE restaurant_id = ? AND deleted_at IS NULL
    ORDER BY display_order ASC, created_at ASC
  `).all(restaurant.id) as MenuItem[];

  // Organize items by category
  const categoriesWithItems: CategoryWithItems[] = categories.map(category => ({
    ...category,
    items: items.filter(item => item.category_id === category.id)
  }));

  // Track view
  db.prepare(`
    INSERT INTO menu_views (id, restaurant_id, viewed_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `).run(crypto.randomUUID(), restaurant.id);

  // Calculate approximate page size for bandwidth tracking
  const pageData = {
    restaurant,
    settings,
    categories: categoriesWithItems,
  };

  const approximateBytes = JSON.stringify(pageData).length;

  // Track bandwidth asynchronously (non-blocking)
  trackBandwidth(restaurant.id, approximateBytes, true).catch(err => {
    console.error('[BANDWIDTH TRACKING ERROR]', err);
  });

  return pageData;
}

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMenuData(slug);

  if (!data) {
    notFound();
  }

  const { restaurant, settings, categories } = data;

  // Select template based on settings.template_id
  const templateId = settings.template_id || 'classic';

  const templateProps = {
    restaurantName: restaurant.name,
    categories,
    settings,
  };

  switch (templateId) {
    case 'modern':
      return <ModernTemplate {...templateProps} />;
    case 'minimal':
      return <MinimalTemplate {...templateProps} />;
    case 'elegant':
      // Elegant template to be implemented in Phase 4
      return <ClassicTemplate {...templateProps} />;
    case 'classic':
    default:
      return <ClassicTemplate {...templateProps} />;
  }
}
