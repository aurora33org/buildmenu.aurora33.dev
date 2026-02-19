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

## 🚀 Quick Start (Local)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

```bash
npm run docker:up
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Default configuration works with Docker setup.

### 4. Run Migrations & Seed

```bash
npm run db:migrate:dev
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Credentials

**Super Admin:**
- Email: `admin@menu.local`
- Password: `admin123`

⚠️ **Change these credentials in production!**

---

## 🚢 Deployment Options

The project supports two production deployment options. See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.

### Option 1: Dokploy + PostgreSQL (Self-hosted) ⭐ Recommended

Full control over your infrastructure. Uses Nixpacks for automatic Next.js build detection.

**Quick overview:**
1. Create a PostgreSQL service in Dokploy
2. Create a new App in Dokploy → connect GitHub repo → Nixpacks
3. Configure environment variables (see below)
4. Deploy — migrations run automatically on start

**Environment variables for Dokploy:**
```bash
DATABASE_URL=postgresql://USER:PASSWORD@postgres:5432/DATABASE
DIRECT_URL=postgresql://USER:PASSWORD@postgres:5432/DATABASE
SESSION_SECRET=<generate with: openssl rand -base64 32>
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
NEXT_PUBLIC_APP_URL=https://your-dokploy-domain.com
```

> **Note:** In Dokploy, `DATABASE_URL` and `DIRECT_URL` are the same (no pgbouncer needed).

### Option 2: Vercel + Supabase (Managed)

Serverless deployment with managed PostgreSQL.

**Quick overview:**
1. Create a PostgreSQL project in Supabase
2. Import repo in Vercel → configure environment variables → Deploy
3. Run migrations locally pointing to Supabase: `./scripts/deploy-to-production.sh`

**Environment variables for Vercel + Supabase:**
```bash
# Transaction mode (runtime) - port 6543 with pgbouncer
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection (migrations) - port 5432 without pgbouncer
DIRECT_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres

SESSION_SECRET=<generate with: openssl rand -base64 32>
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

> **Note:** Vercel+Supabase requires TWO different URLs. Supabase uses pgbouncer connection pooling.

---

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
├── scripts/                      # Deployment scripts
│   └── deploy-to-production.sh  # Vercel+Supabase helper
├── nixpacks.toml                 # Dokploy/Nixpacks build config
├── docker-compose.yml            # Local PostgreSQL container
├── DEPLOYMENT.md                 # Full deployment guide
└── DEPLOYMENT-CHECKLIST.md       # Post-deploy verification
```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server (runs migrations first)
- `npm run lint` - Run ESLint

### Database (PostgreSQL + Prisma)
- `npm run docker:up` - Start local PostgreSQL container
- `npm run docker:down` - Stop local PostgreSQL container
- `npm run db:migrate:dev` - Run migrations (development)
- `npm run db:migrate:deploy` - Run migrations (production)
- `npm run db:seed` - Seed database with super admin user
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database (⚠️ destroys all data)

### Deployment
- `npm run deploy:migrate` - Run production migrations
- `npm run deploy:seed` - Seed production database
- `npm run deploy:setup` - Run migrate + seed (Vercel+Supabase)
- `./scripts/deploy-to-production.sh` - Interactive deployment script

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
