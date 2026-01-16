import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db/prisma';
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
  const restaurants = await prisma.restaurant.findMany({
    where: { deletedAt: null },
    select: { slug: true },
  });

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

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
      deletedAt: null,
    },
    select: {
      name: true,
      slug: true,
    },
  });

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
  // Get restaurant
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!restaurant) {
    return null;
  }

  // Get restaurant settings, categories, and items in parallel
  const [settings, categoriesData, items] = await Promise.all([
    prisma.restaurantSettings.findUnique({
      where: { restaurantId: restaurant.id },
    }),
    prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
        deletedAt: null,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        displayOrder: true,
        isVisible: true,
      },
    }),
    prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        deletedAt: null,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        basePrice: true,
        displayOrder: true,
        isVisible: true,
        isFeatured: true,
      },
    }),
  ]);

  // Convert to snake_case for template compatibility
  const categories = categoriesData.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    display_order: cat.displayOrder,
    is_visible: cat.isVisible,
  }));

  const menuItems = items.map(item => ({
    id: item.id,
    category_id: item.categoryId,
    name: item.name,
    description: item.description,
    base_price: item.basePrice,
    display_order: item.displayOrder,
    is_visible: item.isVisible,
    is_featured: item.isFeatured,
  }));

  // Organize items by category
  const categoriesWithItems: CategoryWithItems[] = categories.map(category => ({
    ...category,
    items: menuItems.filter(item => item.category_id === category.id)
  }));

  // Track view
  await prisma.menuView.create({
    data: {
      restaurantId: restaurant.id,
    },
  });

  // Convert settings to snake_case for template compatibility
  const settingsFormatted = settings ? {
    template_id: settings.templateId,
    primary_color: settings.primaryColor,
    secondary_color: settings.secondaryColor,
    accent_color: settings.accentColor,
    background_color: settings.backgroundColor,
    text_color: settings.textColor,
    font_heading: settings.fontHeading,
    font_body: settings.fontBody,
  } : {
    template_id: 'classic',
    primary_color: '#000000',
    secondary_color: '#666666',
    accent_color: '#ff6b6b',
    background_color: '#ffffff',
    text_color: '#000000',
    font_heading: 'Inter',
    font_body: 'Inter',
  };

  // Calculate approximate page size for bandwidth tracking
  const pageData = {
    restaurant,
    settings: settingsFormatted,
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
