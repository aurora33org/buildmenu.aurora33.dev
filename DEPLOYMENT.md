# 🚀 Deployment Guide

This project supports two production deployment options:

| | Dokploy + PostgreSQL | Vercel + Supabase |
|-|---------------------|-------------------|
| **Type** | Self-hosted | Managed/Serverless |
| **DB** | PostgreSQL service in Dokploy | Supabase (managed PostgreSQL) |
| **Build** | Nixpacks (auto-detect) | Vercel (auto-detect) |
| **Migrations** | Auto on startup | Manual (run locally) |
| **Cost** | Server cost only | Free tier available |
| **Control** | Full | Limited |

---

## Option 1: Dokploy + PostgreSQL (Self-hosted)

### Prerequisites
- Dokploy instance running
- GitHub/GitLab repo with the code

### Step 1: Create PostgreSQL Service in Dokploy

1. In Dokploy → **Databases** → **Create Database**
2. Select **PostgreSQL**
3. Configure:
   - **Name**: `menu-create-db` (or any name)
   - **Database**: `menu_create`
   - **User**: `menu_user`
   - **Password**: generate a secure one
4. Click **Create** and wait for it to start
5. Copy the **internal connection string** (e.g., `postgresql://menu_user:password@menu-create-db:5432/menu_create`)

> **Important:** Use the **internal hostname** (service name), not `localhost` or external IP.

### Step 2: Create the App in Dokploy

1. In Dokploy → **Applications** → **Create Application**
2. **Source**: Connect your GitHub/GitLab repo
3. **Build Type**: Nixpacks (auto-detects Next.js)
4. **Branch**: `main` (or your production branch)

### Step 3: Configure Environment Variables

In your Dokploy app → **Environment** tab, add:

```bash
# Database - same URL for both (no pgbouncer in Dokploy)
DATABASE_URL=postgresql://menu_user:password@menu-create-db:5432/menu_create
DIRECT_URL=postgresql://menu_user:password@menu-create-db:5432/menu_create

# Session secret - generate with: openssl rand -base64 32
SESSION_SECRET=your-random-32-char-secret-here

# App URL
NEXT_PUBLIC_APP_URL=https://your-dokploy-domain.com
NEXT_PUBLIC_APP_NAME=Menu Create

# Super Admin credentials for seeding
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!

# Optional
ENABLE_ANALYTICS=true
SESSION_MAX_AGE=604800000
```

> **Note:** `DATABASE_URL` and `DIRECT_URL` are the **same** in Dokploy — no pgbouncer needed.

### Step 4: Deploy

1. Click **Deploy** in Dokploy
2. Nixpacks will automatically:
   - Detect Next.js
   - Install dependencies (`npm ci`)
   - Generate Prisma Client (`postinstall`)
   - Build the app (`npm run build`)
3. On startup, `npm start` will:
   - Run `prisma migrate deploy` (applies all migrations)
   - Start the Next.js server

### Step 5: Seed the Database

After the first successful deployment, run the seed from Dokploy's console or terminal:

```bash
# In Dokploy → your app → Console
npm run deploy:seed
```

This creates the initial super admin with the credentials you set in env vars.

### Step 6: Verify

1. Open your Dokploy app URL
2. Navigate to `/login`
3. Login with `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
4. You should see the admin dashboard

---

## Option 2: Vercel + Supabase (Managed)

### Prerequisites
- Account on [Vercel](https://vercel.com)
- Account on [Supabase](https://supabase.com)
- GitHub/GitLab repo with the code

### Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Configure:
   - **Name**: `menu-create`
   - **Database Password**: generate and save it
   - **Region**: closest to your users
4. Wait 2-3 minutes for provisioning

### Step 2: Get Connection Strings from Supabase

Go to **Settings → Database → Connection string**

You need **two different URLs**:

#### DATABASE_URL (Transaction mode — for runtime):
```
Select "Transaction" in the dropdown
Copy URL → port 6543, with ?pgbouncer=true

postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### DIRECT_URL (Session mode — for migrations):
```
Select "Session" in the dropdown
Copy URL → port 5432, without ?pgbouncer=true

postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
```

> **Important:** Replace `PASSWORD` with your actual database password in both URLs.

### Step 3: Import Project in Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub/GitLab repo
3. **Before deploying**, add environment variables:

```bash
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
SESSION_SECRET=<run: openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=Menu Create
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
ENABLE_ANALYTICS=true
SESSION_MAX_AGE=604800000
```

4. Click **Deploy**

### Step 4: Run Migrations (from your local machine)

Vercel does NOT auto-run migrations on deploy. You must run them manually once:

```bash
# 1. Create local production env file
cp .env.production.example .env.production

# 2. Edit .env.production with your Supabase credentials

# 3. Run interactive deployment script
./scripts/deploy-to-production.sh
```

Or manually:
```bash
# Run migrations
npx dotenv -e .env.production -- npx prisma migrate deploy

# Seed the database
npx dotenv -e .env.production -- npx tsx prisma/seed.ts
```

### Step 5: Verify

1. Open your Vercel URL
2. Navigate to `/login`
3. Login with your super admin credentials

---

## 🔑 Key Differences

### DATABASE_URL vs DIRECT_URL

| Environment | DATABASE_URL | DIRECT_URL |
|-------------|-------------|------------|
| **Local** | `localhost:5434` | same |
| **Dokploy** | `service-name:5432` | same |
| **Supabase** | `pooler:6543?pgbouncer=true` | `db:5432` (direct) |

- **Dokploy**: Both URLs are the same — direct PostgreSQL connection, no pooling needed
- **Supabase**: Two different URLs — `DATABASE_URL` uses pgbouncer pooling for runtime performance, `DIRECT_URL` bypasses pooling for migrations

### Migrations

| Environment | How migrations run |
|-------------|-------------------|
| **Local** | `npm run db:migrate:dev` (manual) |
| **Dokploy** | Automatically on every `npm start` |
| **Vercel** | Manually via `./scripts/deploy-to-production.sh` |

---

## 🛠️ Troubleshooting

### Dokploy: "Connection refused" to database
- Check that the PostgreSQL service is running in Dokploy
- Verify you're using the **internal hostname** (service name), not `localhost`
- Make sure both services are in the same Dokploy network/project

### Dokploy: Migrations fail on startup
- Check the app logs in Dokploy for the exact error
- Verify `DATABASE_URL` is correctly set
- Ensure the PostgreSQL service started before the app

### Vercel: Build fails with DATABASE_URL error
- This is expected on first deploy before env vars are set
- The build is designed to handle missing `DATABASE_URL` gracefully
- Set env vars in Vercel dashboard and redeploy

### Vercel: "Table does not exist"
- Migrations haven't been run yet
- Run `./scripts/deploy-to-production.sh` from your local machine

### Supabase: "Can't reach database"
- Verify both `DATABASE_URL` (port 6543) and `DIRECT_URL` (port 5432) are correct
- Check that the password doesn't contain unescaped special characters
- Verify the Supabase project is active (not paused on free tier)

---

## 📋 Related Documentation

- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Post-deploy verification checklist
- [.env.production.example](./.env.production.example) - Vercel+Supabase env template
- [.env.example](./.env.example) - All environment variables with comments
- [README.md](./README.md) - Project overview and quick start
