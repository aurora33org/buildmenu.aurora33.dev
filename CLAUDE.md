# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant SaaS platform for creating and managing digital restaurant menus. Built with Next.js 15, PostgreSQL/Prisma, and TypeScript.

## Development Commands

### Setup & Database
```bash
# Install dependencies
npm install

# Setup PostgreSQL database with Docker
npm run docker:up

# Run database migrations
npm run db:migrate:dev

# Seed database with initial super admin
npm run db:seed

# View database in Prisma Studio
npm run db:studio

# Reset database (WARNING: destroys all data)
npm run db:reset

# Stop PostgreSQL container
npm run docker:down
```

### Development
```bash
# Start development server (default port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Variables
Copy `.env.example` to `.env.local` and configure:
- `DATABASE_URL`: PostgreSQL connection string (default uses docker-compose settings)
- `SESSION_SECRET`: Secret key for session encryption
- Super admin credentials for initial seed

## Architecture

### Multi-Tenancy Model
- **One-to-One Model**: Each user belongs to exactly one restaurant
- **Two Roles**:
  - `super_admin`: Platform administrators who manage tenants
  - `tenant_user`: Restaurant owners/managers with access to their own restaurant only

### Authentication & Sessions
- Session-based auth using HTTP-only cookies (not JWT)
- Sessions stored in PostgreSQL via Prisma
- Session utilities in `src/lib/auth/session.ts`:
  - `createSession(userId)`: Creates new session, returns token
  - `validateSession(token)`: Validates token, returns user + sessionId
  - `getSessionFromCookie(cookieHeader)`: Helper for API routes
  - Sessions auto-expire after 7 days (configurable via `SESSION_MAX_AGE`)

### Database Layer (Prisma + PostgreSQL)
- **Always use Prisma Client** (`import prisma from '@/lib/db/prisma'`)
- **Never use raw SQL** or the old SQLite `getDatabase()` function
- Field naming: Database uses `snake_case`, Prisma client uses `camelCase`
- Key models: `User`, `Restaurant`, `RestaurantSettings`, `Category`, `MenuItem`, `Session`, `UsageMetric`
- Soft deletes via `deletedAt` timestamp (never hard delete user-facing data)
- All user/restaurant queries must filter `deletedAt IS NULL`

### Route Organization (Next.js App Router)
Routes are organized by user role and access level:

```
src/app/
├── admin/              # Super Admin only (/admin/*)
│   ├── dashboard/      # Analytics, KPIs, system overview
│   ├── tenants/        # Tenant management (CRUD, pause/unpause)
│   └── users/          # User management
├── (tenant)/           # Tenant User only (/)
│   ├── dashboard/      # Restaurant-specific dashboard
│   ├── menu/           # Menu builder (categories, items, drag-drop)
│   ├── settings/       # Restaurant settings (templates, colors, fonts)
│   └── preview/        # Live menu preview
├── (auth)/             # Authentication (/login)
└── (public)/           # Public menus (/:slug)
    └── [slug]/         # Dynamic restaurant menu pages
```

### API Route Patterns
All API routes follow these conventions:

1. **Authentication Check**:
```typescript
const session = await getSessionFromCookie(request.headers.get('cookie'));
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

2. **Role-Based Authorization**:
```typescript
// For super_admin routes
if (session.role !== 'super_admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// For tenant_user routes (verify restaurant access)
if (!session.restaurantId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

3. **Prisma Queries**:
- Always filter soft-deleted records: `where: { deletedAt: null }`
- Use transactions for multi-step operations: `prisma.$transaction()`
- Use `include` for relations, `select` to limit fields
- Use atomic operations: `{ increment: 1 }`, `{ set: [...] }`

4. **Error Handling**:
```typescript
try {
  // ... operation
} catch (error) {
  console.error('Operation name error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### Menu Templates System
- Templates defined as enum in Prisma: `classic`, `modern`, `elegant`, `minimal`
- Settings stored in `RestaurantSettings` table with template-specific configs
- Each template has customizable colors, fonts, and layout options
- Templates are applied via `templateId` field in restaurant settings

### Analytics & Tracking
- Bandwidth tracking in `src/lib/analytics/bandwidth.ts`
- Usage metrics stored in `UsageMetric` model (date-based aggregation)
- `trackBandwidth()`: Non-blocking, async operation for page views
- All analytics functions are async and use Prisma aggregations

### Drag & Drop (Menu Ordering)
- Uses `@dnd-kit` library for categories and menu items
- Each item has `displayOrder` field (integer)
- Reorder endpoints: `/api/menu/categories/reorder` and `/api/menu/items/reorder`
- Reorder uses Prisma transactions to update multiple `displayOrder` values atomically

## Key Technical Decisions

### Why PostgreSQL + Prisma?
The project was migrated from SQLite to PostgreSQL for:
- Better multi-tenancy support
- Production scalability
- ACID compliance for concurrent operations
- Native date/time handling
- Type safety via Prisma ORM

### Prisma Client Singleton Pattern
The Prisma client (`src/lib/db/prisma.ts`) uses a global singleton pattern to prevent multiple instances in development (Next.js hot reload). This is critical for avoiding "too many clients" errors.

### Session Security
- HTTP-only cookies prevent XSS attacks
- Tokens are cryptographically random (32 bytes)
- Sessions stored server-side with expiration timestamps
- Cookie parsing in API routes via `getSessionFromCookie()` helper

### Soft Delete Pattern
All user-facing data uses soft deletes (`deletedAt` timestamp) instead of hard deletes:
- Preserves data integrity and audit trails
- Allows "undo" functionality
- Prevents orphaned foreign key references
- Cascade soft deletes (e.g., deleting category soft-deletes all items)

## Common Patterns

### Creating API Route with Auth
```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie(request.headers.get('cookie'));

  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await prisma.menuItem.findMany({
    where: {
      restaurantId: session.restaurantId,
      deletedAt: null
    }
  });

  return NextResponse.json({ data });
}
```

### Prisma Transaction for Multi-Step Operations
```typescript
const result = await prisma.$transaction(async (tx) => {
  const restaurant = await tx.restaurant.create({
    data: { /* ... */ }
  });

  await tx.restaurantSettings.create({
    data: { restaurantId: restaurant.id, /* ... */ }
  });

  return restaurant;
});
```

### Soft Delete with Cascade
```typescript
await prisma.$transaction([
  prisma.category.update({
    where: { id: categoryId },
    data: { deletedAt: new Date() }
  }),
  prisma.menuItem.updateMany({
    where: { categoryId: categoryId },
    data: { deletedAt: new Date() }
  })
]);
```

## Database Schema Notes

### Important Relations
- `User.restaurantId` → `Restaurant.id`: Each user belongs to one restaurant
- `Restaurant.ownerId` → `User.id`: Each restaurant has one owner
- `MenuItem.categoryId` → `Category.id`: Menu items belong to categories
- `Session.userId` → `User.id`: Sessions belong to users

### Unique Constraints
- `Restaurant.slug`: Used for public menu URLs (`/:slug`)
- `User.email`: Login identifier
- `UsageMetric.(restaurantId, date)`: One metrics record per restaurant per day

### Indexes
Critical indexes for performance:
- `users.email`, `users.restaurantId`
- `restaurants.slug`, `restaurants.ownerId`
- `sessions.token`, `sessions.expiresAt`
- `categories.restaurantId`, `menuItems.restaurantId`

## Default Credentials

After running `npm run db:seed`:
- Email: `admin@menu.local`
- Password: `admin123`
- Role: `super_admin`
