# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Peepos SaaS** - Multi-tenant educational management system for schools in Lima, Peru.

- **Type**: Monorepo with separate backend (Laravel 12) and frontend (React 19 + TypeScript)
- **Architecture**: Database-per-tenant multi-tenancy using Stancl/Tenancy
- **Purpose**: School management (attendance, grading, enrollment, communication, reporting)

## Common Commands

### Frontend (React + Vite + TypeScript)

```bash
cd peepos-saas/frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server (http://localhost:5173)
npm run build                  # Production build
npm run preview                # Preview production build
npm run lint                   # ESLint check
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier
npm run format:check           # Check code formatting
npm run test                   # Run tests with Vitest
npm run test:ui                # Run tests with UI
npm run test:run               # Run tests once (CI mode)
npm run test:coverage          # Run tests with coverage
npm run type-check             # TypeScript type checking
```

### Backend (Laravel 12 + PHP 8.2)

```bash
cd peepos-saas/backend
composer install               # Install dependencies
php artisan serve              # Start dev server (http://localhost:8000)
php artisan key:generate       # Generate application key
php artisan migrate            # Run central DB migrations
php artisan migrate --path=database/migrations/central  # Central DB only
php artisan tenants:migrate    # Run migrations for all tenant databases
php artisan tenants:migrate --tenants=abc-123  # Migrate specific tenant
php artisan db:seed            # Seed central database
php artisan tenants:seed       # Seed all tenant databases
php artisan test               # Run PHPUnit tests
php artisan test --testsuite=Unit      # Unit tests only
php artisan test --testsuite=Feature   # Feature tests only
php artisan pint               # Laravel Pint (code style fixer)
php artisan route:list         # List all registered routes
php artisan tenants:list       # List all tenants
php artisan tenants:create     # Create a new tenant (with prompts)
```

### Docker (Full Stack)

```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # Follow logs
```

## High-Level Architecture

### Multi-Tenancy System (CRITICAL)

This system uses **database-per-tenant** architecture where each school/institution has its own isolated database:

```
MySQL Server
├── peepos_central              # Central DB (tenants, subscriptions, global users)
├── peepos_tenant_abc-123       # School 1's database
├── peepos_tenant_xyz-456       # School 2's database
└── peepos_tenant_def-789       # School 3's database
```

**Tenant Identification Flow:**
1. Frontend stores `tenant_code` in localStorage (e.g., "colegio-sanjose")
2. Frontend sends `X-Tenant-Code` header with every API request
3. Backend middleware (`TenantIdentification`) intercepts request:
   - Looks up tenant in central DB
   - Validates tenant is active
   - Switches database connection to tenant's specific DB
4. All subsequent queries execute against that tenant's database

**Three Security Layers (See docs/SECURITY.md for details):**
1. **BelongsToTenant trait** - Auto-scopes all queries to current tenant_id
2. **ValidateDataOwnership middleware** - Validates user can only access their tenant's data
3. **TenantIdentification middleware** - Database-level isolation

### Backend Structure

```
backend/app/
├── Http/Controllers/Api/V1/
│   ├── Auth/             # Authentication endpoints
│   ├── Superadmin/       # Platform admin (manage tenants/subscriptions)
│   ├── Director/         # School director/principal
│   ├── Docente/          # Teachers
│   ├── Estudiante/       # Students
│   └── Apoderado/        # Parents/Guardians
│
├── Http/Middleware/
│   ├── TenantIdentification.php      # CRITICAL - Identifies tenant & switches DB
│   ├── ValidateDataOwnership.php     # CRITICAL - Prevents cross-tenant access
│   ├── EnsureTenantIsActive.php      # Validates subscription
│   ├── CheckRolePermission.php       # Role-based authorization
│   ├── RateLimitByTenant.php         # Rate limiting per institution
│   └── AuditLog.php                  # Audit logging
│
├── Models/
│   ├── Tenant/Tenant.php             # Lives in CENTRAL DB
│   └── [All other models]            # Live in tenant-specific DBs, use BelongsToTenant trait
│
├── Services/                         # Business logic layer (domain-driven)
│   ├── Tenancy/TenantService.php     # Create/suspend/activate tenants
│   ├── Academic/                     # Academic services (grades, curriculum)
│   ├── Asistencia/                   # Attendance tracking
│   ├── Matricula/                    # Student enrollment
│   └── [Other domain services]
│
└── Traits/
    ├── BelongsToTenant.php           # CRITICAL - Must be used on ALL tenant models
    └── HasUuid.php                   # UUID primary keys
```

**Request Flow:**
```
API Request → TenantIdentification → EnsureTenantIsActive
→ CheckRolePermission → ValidateDataOwnership → Controller
→ Service Layer → Model (with BelongsToTenant) → Tenant-specific DB
```

### Frontend Structure

```
frontend/src/
├── api/
│   ├── client.ts              # Axios instance with auto-injected X-Tenant-Code header
│   └── endpoints/             # Feature-specific API calls (docente.ts, estudiante.ts, etc.)
│
├── pages/                     # Route pages organized by role
│   ├── docente/               # Teacher views (dashboard, attendance, grading, etc.)
│   ├── estudiante/            # Student views (my grades, my tasks, schedule, etc.)
│   ├── director/              # Director views (enrollment, reports, users, etc.)
│   └── apoderado/             # Parent views
│
├── components/                # Reusable UI components
├── hooks/                     # Custom React hooks
├── contexts/                  # React Context providers
├── types/                     # TypeScript type definitions
│   ├── api.types.ts           # API request/response types
│   ├── models.types.ts        # Domain models (Student, Teacher, etc.)
│   └── auth.types.ts          # Authentication types
│
├── config/env.ts              # Environment variable validation
├── main.tsx                   # Entry point
└── App.tsx                    # Main routing setup
```

**State Management:**
- **TanStack React Query** - Server state (API data caching, refetching, mutations)
- **Zustand** - Client state (auth, UI settings, current tenant)

**API Client Pattern:**
```typescript
// src/api/client.ts automatically adds:
// - X-Tenant-Code header from localStorage
// - Authorization: Bearer {token} header
// - Base URL from env
// All API calls use this client for consistency
```

### Role-Based Access Control

The system supports 5 primary roles:
1. **superadmin** - Platform administrator (manages tenants, billing)
2. **director** - School director/principal (manages school, creates users)
3. **docente** - Teachers (attendance, grading, tutoring)
4. **estudiante** - Students (view grades, submit tasks, view attendance)
5. **apoderado** - Parents/Guardians (view child's progress, communicate with school)

Each role has dedicated:
- Backend controllers (`app/Http/Controllers/Api/V1/{Role}/`)
- Frontend pages (`src/pages/{role}/`)
- API routes with middleware (`routes/api.php`)
- Permissions via Spatie Laravel Permission package

## Critical Development Rules

### When Creating New Models

**ALWAYS:**
1. Add `use BelongsToTenant;` trait to the model (unless it's Tenant or Subscription)
2. Add `tenant_id` UUID column in migration
3. Add index on `tenant_id` for performance
4. Place migration in `database/migrations/tenant/` (not central)
5. Test data isolation between tenants

**Example:**
```php
use App\Traits\BelongsToTenant;

class Estudiante extends Model
{
    use BelongsToTenant;  // CRITICAL - prevents cross-tenant data leakage

    protected $fillable = [...];
}
```

### When Creating New API Endpoints

**ALWAYS:**
1. Apply middleware chain: `['auth:sanctum', 'tenant.identify', 'tenant.active', 'validate.ownership', 'role:xxx']`
2. Use API Resource classes for responses (consistent JSON formatting)
3. Place business logic in Service layer, not controllers
4. Use Form Request classes for validation
5. Add to appropriate route file (`api.php` or role-specific)

**Example:**
```php
Route::middleware([
    'auth:sanctum',
    'tenant.identify',      // Identifies tenant & switches DB
    'tenant.active',        // Validates subscription
    'validate.ownership',   // Prevents cross-tenant access
    'role:docente'          // Role-based permission
])->group(function () {
    Route::get('/docente/dashboard', [DocenteController::class, 'dashboard']);
});
```

### When Querying Tenant Data

**NEVER:**
- Use `withoutGlobalScope('tenant')` unless you're a superadmin endpoint
- Hardcode `tenant_id` values in queries
- Query the `Tenant` model from within tenant context

**ALWAYS:**
- Trust the automatic scope from `BelongsToTenant` trait
- Let middleware handle tenant context
- Use policy/gate authorization for additional checks

### When Adding Frontend Features

**ALWAYS:**
1. Use TanStack Query for API calls (caching, refetching, loading states)
2. Define TypeScript types in `src/types/`
3. Use the shared API client (`src/api/client.ts`)
4. Handle loading, error, and empty states
5. Follow role-based routing structure

**Example:**
```typescript
// src/api/endpoints/docente.ts
export const docenteApi = {
  getDashboard: async () => {
    const { data } = await apiClient.get('/docente/dashboard');
    return data;
  }
};

// In component:
const { data, isLoading, error } = useQuery({
  queryKey: ['docente', 'dashboard'],
  queryFn: docenteApi.getDashboard
});
```

## Database Migrations

### Central Database Migrations
```bash
# Located in: database/migrations/central/
php artisan migrate --path=database/migrations/central
```

### Tenant Database Migrations
```bash
# Located in: database/migrations/tenant/
php artisan tenants:migrate           # All tenants
php artisan tenants:migrate --tenants=abc-123  # Specific tenant
```

**IMPORTANT:**
- Central migrations: `tenants`, `subscriptions`, `users` tables
- Tenant migrations: All domain data (students, teachers, grades, etc.)
- Always test migrations on a single tenant first before running on all

## Environment Configuration

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1   # Backend API URL
VITE_ENABLE_AI_IMPORT=true                       # Feature flags
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_QR_ATTENDANCE=true
```

### Backend (.env)
```bash
# Central Database
DB_DATABASE=peepos_central
DB_USERNAME=root
DB_PASSWORD=

# Multi-Tenancy
CENTRAL_DOMAIN=peepos.app
TENANCY_DATABASE_PREFIX=peepos_tenant_
TENANCY_DOMAIN_SUFFIX=.peepos.app

# Cache, Queue, Sessions
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1

# Authentication
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# External Services
GEMINI_API_KEY=                # AI import feature
WHATSAPP_API_URL=              # WhatsApp notifications
WHATSAPP_ACCESS_TOKEN=
```

## Key Files Reference

### Critical Security Files
- `backend/app/Traits/BelongsToTenant.php` - Auto-scopes queries to prevent data leakage
- `backend/app/Http/Middleware/TenantIdentification.php` - Identifies tenant & switches DB
- `backend/app/Http/Middleware/ValidateDataOwnership.php` - Validates ownership
- `docs/SECURITY.md` - Complete security documentation (READ THIS FIRST)

### Configuration
- `backend/config/tenancy.php` - Stancl/Tenancy configuration
- `backend/routes/api.php` - Main API routes
- `backend/routes/api_docente.php` - Docente-specific routes
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/src/api/client.ts` - API client with interceptors

### Models
- `backend/app/Models/Tenant/Tenant.php` - Tenant model (central DB)
- All other models live in tenant-specific databases

### Services
- `backend/app/Services/Tenancy/TenantService.php` - Tenant lifecycle management
- `backend/app/Services/Academic/` - Academic domain services
- `backend/app/Services/Asistencia/` - Attendance services

## Testing

### Frontend Tests
```bash
cd peepos-saas/frontend
npm run test              # Run all tests with Vitest
npm run test:ui           # Interactive test UI
npm run test:coverage     # With coverage report
```

### Backend Tests
```bash
cd peepos-saas/backend
php artisan test                        # All tests
php artisan test --testsuite=Unit       # Unit tests only
php artisan test --testsuite=Feature    # Feature tests only
php artisan test --filter=TenantTest    # Specific test class
```

**IMPORTANT:** Multi-tenancy tests should verify:
1. Data isolation between tenants
2. BelongsToTenant trait works correctly
3. Middleware prevents cross-tenant access
4. Tenant switching works properly

## Common Patterns

### Creating a New Service
```bash
# Backend
php artisan make:service Academic/CalificacionService
# Place business logic here, not in controllers
```

### Creating a New API Resource
```bash
php artisan make:resource EstudianteResource
# Use for consistent JSON formatting
```

### Creating a New Form Request
```bash
php artisan make:request StoreEstudianteRequest
# Use for validation logic
```

### Adding a New Frontend Page
```typescript
// 1. Create page in src/pages/{role}/
// 2. Add route in App.tsx
// 3. Create API endpoint in src/api/endpoints/
// 4. Define types in src/types/
// 5. Use TanStack Query for data fetching
```

## Documentation

- `docs/SECURITY.md` - **READ FIRST** - Multi-tenancy security (3 layers of protection)
- `docs/MULTI-TENANCY.md` - Complete multi-tenancy guide (Stancl/Tenancy)
- `peepos-saas/frontend/README.md` - Frontend setup and deployment
- `peepos-saas/backend/README.md` - Backend setup and deployment
- `backend/DEPLOYMENT.md` - Cloud Run deployment guide

## Important Notes

1. **Multi-tenancy is critical** - Every feature must respect tenant boundaries. Read `docs/SECURITY.md` before making changes.

2. **Middleware order matters** - The middleware chain must be in the correct order: `tenant.identify` → `tenant.active` → `validate.ownership` → `role:xxx`

3. **State management patterns:**
   - Server state: TanStack React Query (API data)
   - Client state: Zustand (auth, UI, settings)
   - Never store tenant data in frontend state without refetching

4. **API versioning** - All routes are under `/api/v1/`. When making breaking changes, create `/api/v2/`.

5. **File uploads** - Use Google Cloud Storage for tenant file isolation (configured in tenancy.php).

6. **Background jobs** - Use Laravel Queue with Redis. Jobs must be tenant-aware (use `TenantAware` trait).

7. **Rate limiting** - Applied per-tenant, not globally. Configure in `RateLimitByTenant` middleware.

8. **Logging** - All tenant actions are logged via `AuditLog` middleware for security/compliance.

9. **Feature flags** - Some modules can be enabled/disabled per tenant via `tenants.modulos_activos` JSON field.

10. **Deployment** - Backend deploys to Google Cloud Run, Frontend to Firebase Hosting (see DEPLOYMENT.md).
