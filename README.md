# Menu Builder MicroSaaS

Plataforma para crear y gestionar menús digitales de restaurantes.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite (better-sqlite3)
- **Auth**: Session-based con HTTP-only cookies
- **Drag & Drop**: @dnd-kit
- **QR Generation**: qrcode

## Arquitectura

- **Multi-tenant**: Una instancia maneja múltiples restaurantes
- **Acceso 1:1**: Cada usuario tiene un restaurante asignado
- **2 Roles**:
  - `super_admin`: Gestiona tenants y usuarios
  - `tenant_user`: Solo accede a su restaurante

## Comenzar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y ajusta los valores:

```bash
cp .env.example .env.local
```

### 3. Crear base de datos

```bash
mkdir data
npm run db:migrate
npm run db:seed
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Credenciales Iniciales

Super Admin:
- Email: `admin@menu.local`
- Password: `admin123`

## Estructura del Proyecto

```
menu-create/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/            # Super Admin routes
│   │   ├── (tenant)/         # Tenant User routes
│   │   ├── (auth)/           # Login
│   │   └── (public)/         # Public menus
│   ├── components/           # React components
│   ├── lib/                  # Core logic
│   │   ├── db/               # Database schema & queries
│   │   ├── auth/             # Authentication
│   │   └── templates/        # Menu templates
│   ├── hooks/                # React hooks
│   └── types/                # TypeScript types
├── public/                   # Static assets
└── data/                     # SQLite database
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm start` - Iniciar producción
- `npm run lint` - Linter ESLint

## Fases de Desarrollo

- [x] **Phase 1**: Fundación (Auth + Tenants CRUD)
- [ ] **Phase 2**: Menu Builder Core
- [ ] **Phase 3**: UX Avanzado (Drag & Drop)
- [ ] **Phase 4**: Features Completas
- [ ] **Phase 5**: Deployment

## License

Privado - Uso exclusivo para clientes de la agencia
