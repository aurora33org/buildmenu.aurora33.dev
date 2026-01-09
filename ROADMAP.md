# Menu Builder MicroSaaS - Roadmap de Desarrollo

## Estado Actual

### ✅ Phase 1: Fundación (COMPLETADO)
- Sistema de autenticación
- Base de datos SQLite
- CRUD de tenants (versión original)
- Layouts admin y tenant

### ✅ Phase 2: Menu Builder Core (COMPLETADO)
- CRUD de categorías e items
- Classic Template implementado
- Página pública con ISR
- Menu editor funcional

### 🚧 EN PROGRESO: Nuevo Flujo de Onboarding
- Wizard multi-paso para tenants
- Dashboard admin con analytics
- Sistema simplificado de creación de usuarios

---

## Fases Futuras

### Phase 3: UX Avanzado (Próxima Fase)

**Objetivo:** Drag & drop + customización + más templates

**Tareas:**
1. ✅ Integrar `@dnd-kit/core` para drag & drop
   - Reordenar categorías arrastrando
   - Reordenar items dentro de categorías
   - Persistir orden en `display_order`

2. ✅ Panel de customización (colores + fuentes)
   - `/settings` page para tenant user
   - Color pickers para primary, secondary, accent, background, text
   - Selector de fuentes de Google Fonts
   - Preview en tiempo real

3. ✅ Implementar Modern Template
   - Layout: Grid (2 columnas en tablet+)
   - Tipografía: Sans-serif bold (Poppins)
   - Estilo: Cards con sombras, colores vibrantes

4. ✅ Implementar Minimal Template
   - Layout: Lista simple, left-aligned
   - Tipografía: Sans-serif clean (Inter)
   - Estilo: Sin borders/sombras, íconos minimalistas

5. ✅ Sistema de tags (vegetariano, vegano, etc)
   - CRUD de tags
   - Asignar tags a items
   - Mostrar tags en menú público

6. ✅ Generación de QR code
   - Botón "Descargar QR" en dashboard tenant
   - API endpoint `/api/menu/qr`
   - QR code descargable en PNG

7. ✅ Preview en tiempo real (split-screen)
   - `/preview` page con iframe
   - Actualización automática al editar

**Entregable:** Builder intuitivo con personalización completa

**Tiempo estimado:** 1 semana

---

### Phase 4: Features Completas

**Objetivo:** Variantes + horarios + template Elegant + más customización

**Tareas:**
1. ✅ Price variants (tamaños)
   - Tabla `price_variants`
   - UI para agregar Small, Medium, Large
   - Mostrar precios en menú público

2. ✅ Item variants (customizaciones)
   - Tabla `item_variants`
   - Ej: "Extra queso $2", "Sin cebolla gratis"
   - UI para gestionar variants

3. ✅ Availability schedules (horarios/días)
   - Tabla `availability_schedules`
   - UI para configurar horarios
   - Mostrar "No disponible" en menú si fuera de horario

4. ✅ Implementar Elegant Template
   - Layout: Centrado, single column
   - Tipografía: Serif elegante (Cormorant)
   - Estilo: Whitespace generoso, colores sofisticados

5. ✅ Dashboard con estadísticas básicas
   - Gráficos de visitas (últimos 30 días)
   - Items más vistos
   - Horas pico de visitas

6. ✅ Settings page completa (timezone, moneda)
   - Selector de timezone
   - Selector de moneda
   - Configuración de idioma del menú

7. ✅ Soft deletes + audit trail
   - Ya implementado soft deletes
   - Agregar `updated_by` a tablas críticas
   - Log de cambios en tabla `audit_log`

**Entregable:** MVP completo listo para producción

**Tiempo estimado:** 1.5 semanas

---

### Phase 5: Deployment & Testing

**Objetivo:** Deploy a VPS + testing con usuarios reales

**Tareas:**
1. ✅ Configurar Dokploy
   - Instalar Dokploy en VPS
   - Conectar repositorio Git
   - Configurar deployment automático

2. ✅ Deploy a VPS
   - Configurar variables de entorno
   - Setup de volúmenes para SQLite
   - Configurar networking

3. ✅ Configurar SSL
   - Certificado Let's Encrypt
   - HTTPS obligatorio
   - Redirects HTTP → HTTPS

4. ✅ Setup de backups automáticos
   - Cron job diario: backup de .db
   - Almacenar en VPS host
   - Opcional: sync a S3

5. ✅ Testing con 3-5 restaurantes piloto
   - Onboarding completo de usuarios reales
   - Recopilar feedback
   - Identificar bugs

6. ✅ Bug fixes
   - Corregir issues encontrados en testing
   - Optimizar performance
   - Mejorar UX basado en feedback

7. ✅ Documentación de usuario
   - Guía de inicio rápido
   - FAQs
   - Video tutoriales (opcional)

**Entregable:** Aplicación en producción con usuarios activos

**Tiempo estimado:** 1 semana

---

## Features Futuras (Post-MVP)

### Monetización
- Sistema de planes (Free, Pro, Enterprise)
- Límites por plan
- Stripe integration
- Página de pricing

### Colaboración
- Múltiples usuarios por restaurante
- Roles: Owner, Editor, Viewer
- Invitaciones por email

### Marketing
- Analytics avanzados
  - Google Analytics integration
  - Heat maps
  - Conversion tracking
- SEO optimization
  - Sitemap automático
  - Schema.org markup
  - Meta tags optimizados
- Social sharing
  - Open Graph images
  - Twitter Cards

### Multimedia
- Logo upload (Cloudinary/S3)
- Fotos de platillos
- Videos de preparación
- Galería de imágenes

### Internacionalización
- Multi-idioma en menús
- Traducción automática (opcional)
- Precios en múltiples monedas

### Integrations
- POS systems
- Delivery platforms (Uber Eats, DoorDash)
- Reservation systems (OpenTable)
- WhatsApp Business API

### Advanced Menu Features
- Combos y promociones
- Menú del día
- Seasonal menus
- Nutritional information
- Allergen warnings expandidos

### Admin Tools
- Bulk import/export (CSV, Excel)
- Duplicate restaurants
- Templates marketplace
- White-label options

---

## Decisiones Técnicas Clave

### Escalabilidad
- **SQLite para MVP** (hasta 100 restaurantes)
- **Migración a PostgreSQL** cuando:
  - Supere 100 restaurantes activos
  - Necesite replicación
  - Requiera analytics complejos en tiempo real

### Performance
- **ISR** en menús públicos (revalidación cada hora)
- **CDN** para assets estáticos (CloudFront o similar)
- **Image optimization** con Next.js Image component
- **Database indexes** en queries frecuentes

### Seguridad
- **HTTP-only cookies** para sesiones
- **CSRF protection** en forms
- **Rate limiting** en APIs públicas
- **Input sanitization** con Zod
- **SQL injection prevention** con prepared statements

### Monitoreo
- **Error tracking**: Sentry
- **Performance monitoring**: Vercel Analytics o similar
- **Uptime monitoring**: UptimeRobot
- **Logs**: Structured logging con Winston

---

## Métricas de Éxito

### Técnicas
- Load time página pública: <2s
- Admin builder responsive: <100ms
- Uptime: 99.5%+
- Lighthouse score: >90

### Negocio
- 10+ restaurantes activos en primer mes
- Tiempo promedio de onboarding: <5 min
- Satisfacción usuario: >4.5/5 estrellas
- 5+ restaurantes activos después de 90 días
- Feedback positivo en 80%+ de interacciones

### Uso
- Promedio de actualizaciones de menú: 2/semana
- Visitas a menús públicos: 100+/restaurante/mes
- Tiempo en menú público: >30 segundos

---

## Riesgos y Mitigaciones

### Riesgo 1: Usuarios no completan onboarding
- **Mitigación**:
  - Wizard super simple (4 pasos)
  - Progress bar visible
  - Permitir "guardar y continuar" (futuro)
  - Email de seguimiento si abandona

### Riesgo 2: Performance con muchos menús
- **Mitigación**:
  - ISR desde el inicio
  - Monitorear con New Relic
  - Plan de migración a PostgreSQL listo

### Riesgo 3: Usuarios necesitan features no planificadas
- **Mitigación**:
  - Feedback loop activo
  - Roadmap flexible
  - MVP primero, iterar después

### Riesgo 4: Competencia
- **Mitigación**:
  - Enfoque en nicho (restaurantes pequeños/medianos)
  - UX superior
  - Soporte personalizado
  - Pricing competitivo

---

## Próximos Pasos Inmediatos

1. ✅ **Completar implementación de onboarding**
2. 🔄 **Testing exhaustivo del nuevo flujo**
3. 📋 **Phase 3: Drag & drop + customización**
4. 🎨 **Phase 3: Implementar Modern y Minimal templates**
5. 📊 **Phase 4: Variantes y horarios**
6. 🚀 **Phase 5: Deploy a producción**

---

**Última actualización:** Enero 2026
