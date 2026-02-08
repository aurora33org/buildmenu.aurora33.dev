export type {
  User,
  Restaurant,
  RestaurantSettings,
  Category,
  MenuItem,
  PriceVariant,
  ItemVariant,
  Tag,
  ItemTag,
  AvailabilitySchedule,
  Session,
  MenuView,
  UsageMetric,
  UserRole,
  TemplateId
} from '@prisma/client';

// Extended types for common queries
import type { User, Restaurant, Category, MenuItem, PriceVariant, Tag } from '@prisma/client';

export type UserWithRestaurant = User & {
  restaurant: Restaurant | null;
};

export type CategoryWithItemCount = Category & {
  _count: { menuItems: number };
};

export type MenuItemWithDetails = MenuItem & {
  category: Category;
  priceVariants: PriceVariant[];
  tags: { tag: Tag }[];
};

export type RestaurantWithSettings = Restaurant & {
  settings: RestaurantSettings | null;
};

export type RestaurantWithOwner = Restaurant & {
  owner: User;
};

import type { RestaurantSettings } from '@prisma/client';
