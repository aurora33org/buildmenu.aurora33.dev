# 📋 Deployment Checklist

Use esta checklist para verificar que tu deployment esté funcionando correctamente.

---

## Pre-Deployment

### Configuración de Supabase
- [ ] Proyecto de Supabase creado
- [ ] `DATABASE_URL` obtenida (Transaction mode, puerto 6543, con `?pgbouncer=true`)
- [ ] `DIRECT_URL` obtenida (puerto 5432, sin `?pgbouncer=true`)
- [ ] Contraseña de BD guardada de forma segura

### Configuración de Vercel
- [ ] Proyecto importado en Vercel
- [ ] Todas las variables de entorno configuradas:
  - [ ] `DATABASE_URL`
  - [ ] `DIRECT_URL`
  - [ ] `SESSION_SECRET` (generado con `openssl rand -base64 32`)
  - [ ] `SUPER_ADMIN_EMAIL`
  - [ ] `SUPER_ADMIN_PASSWORD`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_APP_NAME`
  - [ ] `ENABLE_ANALYTICS`
- [ ] Variables asignadas a Production, Preview, y Development

---

## Durante el Deployment

### Migrations y Seed
- [ ] Archivo `.env.production` creado localmente (desde `.env.production.example`)
- [ ] Migrations ejecutadas: `npm run deploy:migrate`
- [ ] Seed ejecutado: `npm run deploy:seed`
- [ ] Verificar en Supabase que las tablas existen:
  - [ ] `users`
  - [ ] `restaurants`
  - [ ] `restaurant_settings`
  - [ ] `categories`
  - [ ] `menu_items`
  - [ ] `sessions`
  - [ ] Otras tablas del schema

### Vercel Build
- [ ] Build completado exitosamente
- [ ] No hay errores en los logs de build
- [ ] Deploy asignado a dominio de producción

---

## Post-Deployment

### Verificación Funcional

#### 1. Acceso General
- [ ] URL de producción carga correctamente
- [ ] No hay errores 500 en la página principal
- [ ] Assets (CSS, JS, imágenes) cargan correctamente

#### 2. Autenticación
- [ ] Página de login (`/login`) carga
- [ ] Login con super admin funciona:
  - Email: `[tu email]`
  - Password: `[tu password]`
- [ ] Logout funciona
- [ ] Redirect después de login funciona
- [ ] Sesión persiste en refresh

#### 3. Dashboard Admin
- [ ] Dashboard admin (`/admin/dashboard`) carga
- [ ] Analytics muestran datos (o vacío si recién creado)
- [ ] No hay errores en consola del browser

#### 4. Gestión de Tenants
- [ ] `/admin/tenants` carga
- [ ] Crear nuevo tenant funciona:
  - [ ] Formulario se envía correctamente
  - [ ] Tenant aparece en la lista
  - [ ] Datos se guardan en BD (verificar en Supabase)
- [ ] Editar tenant funciona
- [ ] Pausar/Despausar tenant funciona
- [ ] Eliminar tenant funciona (soft delete)

#### 5. Gestión de Usuarios
- [ ] `/admin/users` carga
- [ ] Crear nuevo usuario funciona
- [ ] Asignar usuario a restaurante funciona
- [ ] Editar usuario funciona
- [ ] Eliminar usuario funciona

#### 6. Menu Builder (Tenant User)
- [ ] Login con usuario tenant funciona
- [ ] Dashboard tenant carga
- [ ] `/menu` carga correctamente
- [ ] Crear categoría funciona
- [ ] Crear ítem de menú funciona
- [ ] Drag & drop reorder funciona
- [ ] Editar ítems funciona
- [ ] Eliminar ítems funciona
- [ ] Featured items se marcan correctamente

#### 7. Settings de Restaurante
- [ ] `/settings` carga
- [ ] Cambiar template funciona (Classic, Modern, Elegant, Minimal)
- [ ] Cambiar colores funciona
- [ ] Cambiar fuentes funciona
- [ ] Guardar settings funciona
- [ ] Preview en vivo se actualiza

#### 8. Menú Público
- [ ] `/:slug` carga para un restaurante existente
- [ ] Template seleccionado se renderiza correctamente
- [ ] Colores custom se aplican
- [ ] Fuentes custom se cargan
- [ ] Categorías se muestran en orden correcto
- [ ] Ítems se muestran en orden correcto
- [ ] Precios se muestran correctamente
- [ ] Featured items destacan visualmente
- [ ] Responsive funciona en mobile
- [ ] No hay errores en consola

---

## Performance y Seguridad

### Performance
- [ ] Lighthouse Performance score: 90+ (desktop)
- [ ] Lighthouse Performance score: 80+ (mobile)
- [ ] Lighthouse Accessibility score: 100
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Google Fonts cargan sin FOUT/FOIT excesivo

### Seguridad
- [ ] HTTPS habilitado (automático en Vercel)
- [ ] Headers de seguridad configurados
- [ ] Cookies son HTTP-only
- [ ] No hay credenciales en código fuente
- [ ] Variables de entorno no están expuestas al cliente
- [ ] SQL injection protegido (Prisma parametriza queries)
- [ ] XSS protegido (sanitización de inputs)
- [ ] CORS configurado apropiadamente

### Monitoreo
- [ ] Vercel Analytics funciona
- [ ] Logs de Vercel accesibles
- [ ] Logs de Supabase accesibles
- [ ] Error tracking configurado (opcional: Sentry)

---

## Database Health

### Supabase Dashboard
- [ ] Connection pooling activo
- [ ] Número de conexiones dentro de límites
- [ ] No hay queries lentas (>1s)
- [ ] Tamaño de BD dentro de límites del plan Free

### Prisma Studio (Opcional)
- [ ] Conectar con `npx prisma studio` usando `.env.production`
- [ ] Verificar datos en tablas:
  - [ ] Usuario super admin existe
  - [ ] Relaciones están correctas
  - [ ] No hay datos corruptos

---

## Rollback Plan

En caso de problemas críticos:

### Opción 1: Rollback de Vercel
```bash
# Ver deployments
vercel ls

# Rollback a deployment anterior
vercel rollback [deployment-url]
```

### Opción 2: Revertir Migrations
```bash
# Solo si es absolutamente necesario
# Conectar a Supabase y ejecutar rollback manual
```

### Opción 3: Restore Database
```bash
# Usar backup de Supabase (si disponible)
# Supabase → Database → Backups → Restore
```

---

## Problemas Comunes

### Error: "Can't reach database server"
**Solución:**
1. Verificar que `DATABASE_URL` y `DIRECT_URL` sean correctas
2. Verificar que la contraseña no tenga caracteres especiales sin escapar
3. Verificar conexión de Supabase en Settings → Database

### Error: "Table does not exist"
**Solución:**
1. Ejecutar migrations: `npm run deploy:migrate`
2. Verificar en Supabase que las tablas existan

### Error: 500 en producción
**Solución:**
1. Revisar logs en Vercel → Functions → Errors
2. Revisar logs de Supabase → Database → Logs
3. Verificar variables de entorno

### Build falla
**Solución:**
1. Verificar que `postinstall` script esté en `package.json`
2. Limpiar cache de Vercel
3. Revisar logs de build completos

---

## Mantenimiento Post-Deploy

### Semanal
- [ ] Revisar logs de errores en Vercel
- [ ] Revisar performance en Vercel Analytics
- [ ] Verificar que backup de Supabase esté activo

### Mensual
- [ ] Revisar uso de BD en Supabase (storage, connections)
- [ ] Actualizar dependencias si hay security patches
- [ ] Revisar y limpiar sessions expiradas

### Semestral
- [ ] Rotar `SESSION_SECRET`
- [ ] Actualizar contraseñas de super admin
- [ ] Hacer backup manual de BD
- [ ] Revisar y optimizar queries lentas

---

## Documentación de Referencia

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa de deployment
- [TESTING.md](./TESTING.md) - Manual de testing
- [CLAUDE.md](./CLAUDE.md) - Documentación del proyecto
- [README.md](./README.md) - Información general

---

**Última Actualización**: 2026-02-07
**Version**: 1.0
