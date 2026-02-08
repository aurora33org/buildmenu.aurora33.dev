# 🚀 Deployment Guide: Vercel + Supabase

Esta guía te ayudará a desplegar Menu Create en Vercel con base de datos PostgreSQL en Supabase.

---

## 📋 Pre-requisitos

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [Supabase](https://supabase.com)
- ✅ Git repository con el código (GitHub, GitLab, o Bitbucket)

---

## PASO 1: Configurar Supabase (Base de Datos)

### 1.1 Crear Proyecto

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en **"New Project"**
3. Configura:
   - **Name**: `menu-create-test` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y **guárdala** (la necesitarás)
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Pricing Plan**: Free (suficiente para testing)
4. Click en **"Create new project"**
5. Espera 2-3 minutos mientras Supabase provisiona tu base de datos

### 1.2 Obtener Connection Strings

1. En tu proyecto de Supabase, ve a **Settings** (⚙️ ícono en la sidebar) → **Database**
2. Busca la sección **"Connection string"**
3. Necesitas **DOS URLs diferentes**:

#### **DATABASE_URL** (Para la aplicación - con connection pooling):
```
Selecciona: "Transaction" mode
Copia el string que se ve así:
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### **DIRECT_URL** (Para migrations - conexión directa):
```
Selecciona: "Session" mode
Copia el string y cámbialo de puerto 6543 a 5432 y QUITA el parámetro pgbouncer:
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con tu contraseña real en ambas URLs.

### 1.3 Guardar las URLs

Guarda ambas URLs en un lugar seguro (las necesitarás en el siguiente paso).

---

## PASO 2: Configurar Vercel

### 2.1 Importar Proyecto

1. Ve a [https://vercel.com/new](https://vercel.com/new)
2. Selecciona tu repositorio Git (GitHub/GitLab/Bitbucket)
3. Click en **"Import"**

### 2.2 Configurar Variables de Entorno

**ANTES de hacer el deploy**, configura estas variables de entorno:

```bash
# 1. Database URLs (de Supabase)
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# 2. Session Secret (genera uno nuevo)
SESSION_SECRET=tu-secret-super-seguro-de-al-menos-32-caracteres-aqui

# 3. Application URLs
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=Menu Create

# 4. Super Admin Credentials (para seed)
SUPER_ADMIN_EMAIL=admin@tudominio.com
SUPER_ADMIN_PASSWORD=TuPasswordSeguro123!

# 5. Optional Features
ENABLE_ANALYTICS=true
SESSION_MAX_AGE=604800000
```

**Cómo agregar variables en Vercel:**
1. En la página de configuración del proyecto, busca **"Environment Variables"**
2. Agrega cada variable: **Key** → **Value** → **Add**
3. Asegúrate de seleccionar **Production**, **Preview**, y **Development**

### 2.3 Deploy

1. Una vez configuradas todas las variables, click en **"Deploy"**
2. Espera 2-5 minutos mientras Vercel construye tu aplicación
3. **IMPORTANTE**: El primer deploy fallará o no tendrá datos porque la base de datos está vacía

---

## PASO 3: Ejecutar Migrations y Seed

Ahora necesitas correr las migraciones y el seed en la base de datos de producción.

### Opción A: Desde tu computadora local

```bash
# 1. Crea un archivo .env.production en la raíz del proyecto
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
SUPER_ADMIN_EMAIL="admin@tudominio.com"
SUPER_ADMIN_PASSWORD="TuPasswordSeguro123!"
EOF

# 2. Ejecutar migrations
npx dotenv-cli -e .env.production -- npx prisma migrate deploy

# 3. Generar Prisma Client
npx dotenv-cli -e .env.production -- npx prisma generate

# 4. Ejecutar seed
npx dotenv-cli -e .env.production -- npx tsx prisma/seed.ts

# 5. (Opcional) Verificar en Prisma Studio
npx dotenv-cli -e .env.production -- npx prisma studio
```

### Opción B: Desde Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link al proyecto
vercel link

# 4. Pull environment variables
vercel env pull .env.production

# 5. Ejecutar migrations
npx dotenv-cli -e .env.production -- npx prisma migrate deploy

# 6. Ejecutar seed
npx dotenv-cli -e .env.production -- npx tsx prisma/seed.ts
```

---

## PASO 4: Verificar el Deployment

### 4.1 Acceder a la aplicación

1. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Deberías ver la página de login

### 4.2 Login con Super Admin

Usa las credenciales que configuraste:
```
Email: admin@tudominio.com
Password: TuPasswordSeguro123!
```

### 4.3 Verificar funcionalidad

- ✅ Login funciona
- ✅ Dashboard admin carga
- ✅ Puedes crear un tenant de prueba
- ✅ Menú público es accesible

---

## PASO 5: Configuraciones Post-Deploy

### 5.1 Configurar Dominio Custom (Opcional)

1. En Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio custom
3. Configura los DNS según las instrucciones de Vercel
4. Actualiza `NEXT_PUBLIC_APP_URL` con tu nuevo dominio

### 5.2 Monitoreo

**Logs en Vercel:**
- Ve a tu proyecto → **Deployments** → Click en el deployment → **Runtime Logs**

**Database en Supabase:**
- Ve a **Database** → **Tables** para ver tus datos
- Ve a **Database** → **Logs** para ver queries

### 5.3 Backups

Supabase hace backups automáticos en el plan Free:
- **Point-in-time recovery**: No disponible en Free
- **Daily backups**: Sí, retenidos por 7 días

Para backups manuales:
```bash
# Conectarte a Supabase con pg_dump
pg_dump "postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" > backup.sql
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Causa**: Prisma no puede conectarse a Supabase.

**Solución**:
1. Verifica que `DATABASE_URL` y `DIRECT_URL` estén correctamente configuradas
2. Asegúrate de que la contraseña no tenga caracteres especiales sin escapar
3. Verifica que estás usando el modo correcto (Transaction vs Session)

### Error: "Prisma Client not generated"

**Causa**: El Prisma Client no se generó durante el build.

**Solución**:
1. Verifica que el build command en Vercel sea: `npm run build`
2. Asegúrate de que `postinstall` script esté en `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

### Error: "Table does not exist"

**Causa**: Las migraciones no se ejecutaron.

**Solución**:
1. Ejecuta las migraciones manualmente (ver Paso 3)
2. Verifica en Supabase que las tablas existan: **Database** → **Tables**

### Deployment lento o fallido

**Causa**: Build timeout o límites de Vercel.

**Solución**:
1. Verifica que no estés en el límite de builds del plan Free
2. Optimiza `node_modules` si es muy grande
3. Considera upgrade a plan Pro si es necesario

---

## 📊 Monitoreo y Performance

### Supabase Dashboard

- **Database Size**: Settings → Usage
- **Connections**: Database → Connection Pooling
- **Query Performance**: Database → Logs

### Vercel Analytics

- **Response Time**: Analytics tab
- **Error Rate**: Functions → Errors
- **Build Time**: Deployments tab

---

## 🔒 Seguridad en Producción

### ✅ Checklist de Seguridad

- [ ] `SESSION_SECRET` es un string aleatorio de 32+ caracteres
- [ ] `SUPER_ADMIN_PASSWORD` es fuerte y único
- [ ] Credenciales de BD no están en el código (solo en env vars)
- [ ] HTTPS está habilitado (Vercel lo hace por defecto)
- [ ] Variables de entorno están solo en Production (no en repo)

### Rotar Credenciales

Si necesitas cambiar la contraseña de la BD:
1. En Supabase: Settings → Database → Reset database password
2. Actualiza `DATABASE_URL` y `DIRECT_URL` en Vercel
3. Redeploy la aplicación

---

## 🚀 CI/CD Automático

Vercel despliega automáticamente en cada push:

- **Push a `main`**: Deploy a Production
- **Push a otras branches**: Deploy a Preview
- **Pull Requests**: Deploy a Preview con URL única

Para desactivar auto-deploy:
1. Vercel → Settings → Git
2. Configura branch rules

---

## 📞 Soporte

### Recursos:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Problemas comunes:
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Vercel + PostgreSQL](https://vercel.com/guides/using-databases-with-vercel)

---

**¡Listo!** Tu aplicación está desplegada en producción 🎉
