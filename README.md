# Menu Create - Digital Restaurant Menus

Multi-tenant SaaS platform for creating and managing digital restaurant menus. Built with Next.js 15, PostgreSQL/Prisma, and TypeScript.

## ✨ Features

- 🎨 **4 Professional Templates**: Classic, Modern, Minimal, and Elegant
- 🖱️ **Drag & Drop Menu Editor**: Intuitive category and item reordering
- 🎨 **Full Customization**: Colors, fonts, and template selection
- 📱 **QR Code Generation**: Instant menu access via QR
- 👥 **Multi-tenant Architecture**: One instance, multiple restaurants
- 🔐 **Secure Authentication**: Session-based with HTTP-only cookies
- 📊 **Analytics Dashboard**: View counts and bandwidth tracking
- 🌐 **ISR-Optimized**: Fast public menus with Incremental Static Regeneration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Session-based (HTTP-only cookies)
- **Drag & Drop**: @dnd-kit
- **QR Codes**: qrcode library
- **Validation**: Zod schemas
- **Fonts**: Google Fonts (Next.js Font Optimization)

## 🏗️ Architecture

### Multi-Tenancy Model
- **One-to-One**: Each user belongs to exactly one restaurant
- **Two Roles**:
  - `super_admin`: Platform administrators who manage tenants
  - `tenant_user`: Restaurant owners with access to their restaurant only

### Key Features
- Session-based authentication (no JWT)
- Soft deletes on all user-facing data
- PostgreSQL for production scalability
- ISR for public menus (1-hour cache)
- Real-time bandwidth tracking

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

Start PostgreSQL with Docker:

```bash
npm run docker:up
```

### 3. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Default configuration works with Docker setup. Update if needed.

### 4. Run Database Migrations

```bash
npm run db:migrate:dev
```

### 5. Seed Initial Data

```bash
npm run db:seed
```

This creates a super admin user with credentials below.

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Credentials

**Super Admin:**
- Email: `admin@menu.local`
- Password: `admin123`

⚠️ **Change these credentials in production!**

## 📁 Project Structure

```
menu-create/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── admin/                # Super Admin routes
│   │   │   ├── dashboard/        # Analytics & KPIs
│   │   │   ├── tenants/          # Tenant management
│   │   │   └── users/            # User management
│   │   ├── (tenant)/             # Tenant User routes
│   │   │   ├── dashboard/        # Restaurant dashboard
│   │   │   ├── menu/             # Menu builder
│   │   │   ├── settings/         # Restaurant settings
│   │   │   └── preview/          # Menu preview
│   │   ├── (auth)/               # Authentication
│   │   │   └── login/            # Login page
│   │   ├── (public)/             # Public menus
│   │   │   └── [slug]/           # Dynamic restaurant pages
│   │   └── api/                  # API routes
│   │       ├── auth/             # Auth endpoints
│   │       ├── menu/             # Menu CRUD
│   │       ├── admin/            # Admin operations
│   │       ├── restaurant/       # Restaurant info
│   │       └── settings/         # Settings management
│   ├── components/               # React components
│   │   ├── admin/                # Admin components
│   │   ├── tenant/               # Tenant components
│   │   ├── public/               # Public menu components
│   │   │   └── templates/        # Menu templates
│   │   └── shared/               # Shared UI components
│   ├── lib/                      # Core logic
│   │   ├── db/                   # Prisma client & schema
│   │   ├── auth/                 # Session management
│   │   ├── analytics/            # Bandwidth tracking
│   │   ├── validations/          # Zod schemas
│   │   └── utils/                # Utility functions
│   ├── hooks/                    # Custom React hooks
│   └── types/                    # TypeScript types
├── prisma/                       # Database
│   ├── schema.prisma             # Prisma schema
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets
└── docker-compose.yml            # PostgreSQL container
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database (PostgreSQL + Prisma)
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run db:migrate:dev` - Run database migrations (development)
- `npm run db:migrate:deploy` - Run database migrations (production)
- `npm run db:seed` - Seed database with super admin user
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database (⚠️ destroys all data)

### Database Management
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# View database in browser
npx prisma studio
```

## 🎯 Development Status

### MVP Features (Completed)
- [x] **Authentication & Authorization**
  - Session-based auth with HTTP-only cookies
  - Role-based access control (super_admin, tenant_user)
  - Protected routes with middleware

- [x] **Onboarding System**
  - 4-step wizard for new restaurants
  - Slug validation and generation
  - Initial settings configuration

- [x] **Menu Management**
  - Full CRUD for categories and menu items
  - Edit functionality for items and categories
  - Drag & drop reordering (@dnd-kit)
  - Soft deletes with recovery options

- [x] **Restaurant Settings**
  - Template selection (4 templates)
  - Color customization (5 color pickers)
  - Font selection (heading + body)
  - Restaurant information editing

- [x] **Public Menus**
  - Dynamic slug-based routing
  - ISR optimization (1-hour cache)
  - 4 professional templates: Classic, Modern, Minimal, Elegant
  - Custom branding (colors, fonts)
  - Responsive design

- [x] **Admin Dashboard**
  - System analytics and KPIs
  - Tenant management (pause/unpause)
  - User management (view, filter, delete)
  - Bandwidth tracking

- [x] **QR Code System**
  - QR generation for menu access
  - Downloadable QR codes
  - Preview functionality

- [x] **Quality & Security**
  - Global error handling with toast notifications
  - Zod validation on all API endpoints
  - Input sanitization
  - Error boundaries

### Post-MVP (Planned)
- [ ] Price variants (Small/Medium/Large)
- [ ] Item customization options
- [ ] Tags system (Vegetarian, Vegan, etc.)
- [ ] Availability schedules
- [ ] Image upload (logo, items)
- [ ] Password reset flow
- [ ] Automated tests
- [ ] Rate limiting
- [ ] CSRF protection

## License

Privado - Uso exclusivo para clientes de la agencia
