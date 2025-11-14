# Backend - Laravel 12 API (Multi-Tenant)

Backend API RESTful construido con Laravel 12 para la plataforma Peepos SaaS.

## Estado Actual
**✅ ESTRUCTURA CREADA** - Arquitectura completa implementada, lista para instalación de dependencias.

## Arquitectura

### Multi-Tenancy
Sistema de multi-tenancy robusto con:
- **Base de datos central**: Gestión de tenants y suscripciones
- **Bases de datos por tenant**: Aislamiento completo de datos por institución
- **Middleware de seguridad**: Prevención de data leakage

### Estructura de Carpetas

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── Auth/              # Autenticación (Login, Register, Logout)
│   │   │   ├── Superadmin/        # Gestión de tenants y suscripciones
│   │   │   ├── Director/          # Panel director de institución
│   │   │   ├── Docente/           # Panel docente (por implementar)
│   │   │   └── Apoderado/         # Panel apoderado (por implementar)
│   │   └── Middleware/            # 🔴 CRÍTICO
│   │       ├── TenantIdentification.php
│   │       ├── EnsureTenantIsActive.php
│   │       ├── ValidateDataOwnership.php  # Previene data leakage
│   │       ├── CheckRolePermission.php
│   │       ├── RateLimitByTenant.php
│   │       └── AuditLog.php
│   ├── Models/
│   │   ├── Tenant/
│   │   │   ├── Tenant.php
│   │   │   └── Subscription.php
│   │   └── User.php
│   ├── Services/
│   │   ├── Tenancy/
│   │   │   ├── TenantService.php
│   │   │   └── TenantDatabaseManager.php
│   │   ├── AI/
│   │   │   └── GeminiService.php  # Integración Gemini AI
│   │   └── Import/
│   │       └── ImportBatchService.php
│   ├── Jobs/
│   │   └── ProcessImportFile.php  # Procesamiento asíncrono
│   └── Traits/
│       ├── BelongsToTenant.php    # 🔴 CRÍTICO - Usar en todos los modelos
│       └── HasUuid.php
├── config/
│   ├── tenancy.php                # Configuración multi-tenant
│   ├── cors.php                   # CORS para frontend
│   └── services.php               # APIs externas
├── database/
│   ├── migrations/
│   │   ├── central/               # BD Central (tenants, subscriptions)
│   │   └── tenant/                # BD por Tenant (estudiantes, etc.)
│   └── seeders/
├── routes/
│   └── api.php                    # Rutas API v1
├── Dockerfile                     # 🔴 Optimizado para Cloud Run
├── cloudbuild.yaml                # 🔴 CI/CD Google Cloud
└── composer.json                  # Dependencias
```

## Tecnologías

### Core
- **Laravel 12** - Framework PHP
- **PHP 8.2+** - Lenguaje
- **MySQL 8.0** - Base de datos
- **Redis** - Cache y Queues

### Packages
- `laravel/sanctum` - Autenticación API
- `stancl/tenancy` - Multi-tenancy
- `spatie/laravel-permission` - Roles y permisos
- `maatwebsite/excel` - Import/Export Excel
- `barryvdh/laravel-dompdf` - Generación PDFs
- `google/cloud-storage` - Storage en GCP
- `google/apiclient` - Integración Google APIs

### IA y Automatización
- **Gemini AI** - Extracción de datos de documentos
- **WhatsApp Business API** - Notificaciones

## Instalación

### Prerequisitos
```bash
- PHP 8.2 o superior
- Composer 2.x
- MySQL 8.0
- Redis
```

### Pasos de Instalación

1. **Instalar dependencias**
```bash
cd backend
composer install
```

2. **Configurar entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Generar clave de aplicación**
```bash
php artisan key:generate
```

4. **Ejecutar migraciones**

BD Central:
```bash
php artisan migrate --path=database/migrations/central
```

BD Tenant (ejemplo):
```bash
php artisan migrate --path=database/migrations/tenant --database=tenant
```

5. **Seeds (opcional)**
```bash
php artisan db:seed
```

6. **Iniciar servidor**
```bash
php artisan serve
# API disponible en: http://localhost:8000
```

## Endpoints API

### Autenticación
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Superadmin
```
GET    /api/v1/superadmin/dashboard
GET    /api/v1/superadmin/tenants
POST   /api/v1/superadmin/tenants
GET    /api/v1/superadmin/subscriptions
```

### Director
```
GET    /api/v1/director/dashboard
GET    /api/v1/director/users
POST   /api/v1/director/users
```

### Health Check
```
GET    /api/health
```

## Seguridad

### 🔴 CRÍTICO - Prevención de Data Leakage

1. **Todos los modelos** que pertenecen a un tenant DEBEN usar el trait `BelongsToTenant`
2. **Middleware obligatorio** en rutas tenant:
   - `tenant.identify` - Identifica el tenant
   - `tenant.active` - Valida suscripción activa
   - `validate.ownership` - Previene acceso cruzado
3. **Logging de auditoría** en todas las acciones sensibles

### Rate Limiting
- Por tenant: 1000 requests/minuto
- Por usuario: 60 requests/minuto

## Deployment a Cloud Run

### Build y Deploy
```bash
# Configurar proyecto GCP
gcloud config set project YOUR_PROJECT_ID

# Build manual
docker build -t gcr.io/YOUR_PROJECT_ID/peepos-backend .
docker push gcr.io/YOUR_PROJECT_ID/peepos-backend

# Deploy con Cloud Build (automático)
gcloud builds submit --config cloudbuild.yaml
```

### Variables de Entorno (Cloud Run)
Ver archivo `.env.cloudrun` para configuración de producción.

### Cloud SQL
```bash
gcloud sql instances create peepos-db \
  --database-version=MYSQL_8_0 \
  --tier=db-n1-standard-1 \
  --region=us-central1
```

## Testing

```bash
# Tests unitarios
php artisan test --testsuite=Unit

# Tests de integración
php artisan test --testsuite=Feature
```

## Próximos Pasos

### Pendientes de Implementación
- [ ] Completar controllers de Docente y Apoderado
- [ ] Implementar sistema de importación masiva con IA
- [ ] Integrar WhatsApp Business API
- [ ] Crear sistema de reportes (SIAGIE)
- [ ] Implementar generación de PDFs (boletas, actas)
- [ ] Agregar tests unitarios y de integración
- [ ] Documentación Swagger/OpenAPI

## Contribuir

1. Seguir PSR-12 para estilo de código
2. Todos los commits deben pasar tests
3. Agregar tests para nuevas features
4. Documentar endpoints en Postman/Swagger

## Soporte

Para issues o preguntas: [soporte@peepos.com](mailto:soporte@peepos.com)
