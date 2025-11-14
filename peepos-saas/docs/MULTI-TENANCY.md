# Multi-Tenancy con Stancl/Tenancy - Peepos SaaS

## Arquitectura: Database Per Tenant

El sistema utiliza **Stancl/Tenancy** con arquitectura de **base de datos separada por institución**, proporcionando máximo aislamiento de datos.

---

## Estructura de Bases de Datos

```
MySQL Server
├── peepos_central                    # BD Central
│   ├── tenants                       # Registro de instituciones
│   ├── subscriptions                 # Suscripciones
│   └── users                         # Usuarios del sistema
│
├── peepos_tenant_abc-123-uuid        # Colegio San José
│   ├── estudiantes                   # Estudiantes de esta institución
│   ├── docentes                      # Docentes de esta institución
│   ├── asistencias                   # Asistencias
│   └── calificaciones                # Notas
│
├── peepos_tenant_xyz-456-uuid        # Colegio Santa María
│   ├── estudiantes
│   ├── docentes
│   ├── asistencias
│   └── calificaciones
│
└── peepos_tenant_def-789-uuid        # Colegio Salesiano
    ├── estudiantes
    ├── docentes
    ├── asistencias
    └── calificaciones
```

---

## Configuración

### Archivo: [config/tenancy.php](../backend/config/tenancy.php)

```php
return [
    'tenant_model' => \App\Models\Tenant\Tenant::class,
    'id_generator' => \Stancl\Tenancy\UuidGenerator::class,

    'database' => [
        'central_domains' => [
            env('CENTRAL_DOMAIN', 'peepos.app'),
            'localhost',
        ],

        'managers' => [
            'database' => \Stancl\Tenancy\TenantDatabaseManagers\MySQLDatabaseManager::class,
        ],

        'prefix' => env('TENANCY_DATABASE_PREFIX', 'peepos_tenant_'),
        'suffix' => '',

        // 🔴 CRÍTICO: Una BD separada por tenant
        'separate_database' => true,
    ],

    'bootstrappers' => [
        DatabaseTenancyBootstrapper::class,
        CacheTenancyBootstrapper::class,
        FilesystemTenancyBootstrapper::class,
        QueueTenancyBootstrapper::class,
    ],
];
```

### Variables de Entorno

```bash
# .env

# Dominio central (no es tenant)
CENTRAL_DOMAIN=peepos.app

# Prefijo para BDs de tenants
TENANCY_DATABASE_PREFIX=peepos_tenant_

# Sufijo para subdominios
TENANCY_DOMAIN_SUFFIX=.peepos.app

# Dominios centrales (separados por coma)
CENTRAL_DOMAINS=peepos.app,www.peepos.app,localhost
```

---

## Identificación de Tenants

### Métodos Soportados

#### 1. Header HTTP (Recomendado para APIs)

```bash
curl -H "X-Tenant-Code: colegio-sanjoser" \
     -H "Authorization: Bearer TOKEN" \
     https://api.peepos.app/v1/director/dashboard
```

#### 2. Subdomain (Para aplicaciones web)

```
https://colegio-sanjose.peepos.app/dashboard
```

El middleware extrae automáticamente `colegio-sanjose` como `tenant_code`.

#### 3. Query Parameter (Solo dev/testing)

```
http://localhost:8000/api/v1/dashboard?tenant_code=colegio-sanjose
```

**IMPORTANTE**: Este método solo funciona en entornos `local` o `testing`.

---

## Middleware de Identificación

### [app/Http/Middleware/TenantIdentification.php](../backend/app/Http/Middleware/TenantIdentification.php)

```php
class TenantIdentification
{
    protected $tenancy;

    public function __construct(Tenancy $tenancy)
    {
        $this->tenancy = $tenancy;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Identificar tenant desde header
        $tenantCode = $request->header('X-Tenant-Code');

        if (!$tenantCode) {
            // Alternativa: desde subdomain
            $host = $request->getHost();
            $subdomain = explode('.', $host)[0] ?? null;
            $tenantCode = $subdomain !== 'www' && $subdomain !== 'api' ? $subdomain : null;
        }

        // Buscar tenant en BD central
        $tenant = Tenant::where('tenant_code', $tenantCode)->first();

        if (!$tenant || $tenant->estado !== 'ACTIVO') {
            return response()->json(['error' => 'Tenant no válido'], 403);
        }

        // 🔴 CRÍTICO: Inicializar tenant con Stancl/Tenancy
        $this->tenancy->initialize($tenant);

        return $next($request);
    }
}
```

### Uso en Rutas

```php
Route::middleware([
    'auth:sanctum',
    'tenant.identify',      // Identifica y conecta a BD del tenant
    'tenant.active',        // Valida suscripción activa
    'validate.ownership',   // Previene data leakage
])->group(function () {
    Route::get('/estudiantes', [EstudianteController::class, 'index']);
});
```

---

## Modelo Tenant

### [app/Models/Tenant/Tenant.php](../backend/app/Models/Tenant/Tenant.php)

```php
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasFactory, SoftDeletes, HasDatabase;

    protected $fillable = [
        'id',
        'tenant_code',      // Código único (ej: colegio-sanjose)
        'name',
        'domain',
        'email',
        'estado',           // ACTIVO, SUSPENDIDO, CANCELADO
        'settings',
    ];

    /**
     * Nombre de la BD del tenant
     * Ej: peepos_tenant_abc-123-uuid
     */
    public function getCustomDatabaseName(): string
    {
        return config('tenancy.database.prefix') . $this->id;
    }
}
```

---

## Migración de Tabla Tenants (BD Central)

```php
Schema::create('tenants', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('tenant_code', 50)->unique();
    $table->string('name');
    $table->string('domain')->unique();
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->string('ruc', 11)->nullable()->unique();
    $table->enum('estado', ['ACTIVO', 'SUSPENDIDO', 'CANCELADO', 'PRUEBA_VENCIDA'])->default('ACTIVO');
    $table->json('settings')->nullable();
    $table->timestamps();
    $table->softDeletes();

    $table->index(['tenant_code']);
    $table->index(['estado', 'created_at']);
});
```

---

## Crear un Nuevo Tenant

### Comando Artisan (Recomendado)

```bash
php artisan tenants:create \
    --tenant_code=colegio-sanjose \
    --name="Colegio San José" \
    --domain=colegio-sanjose \
    --email=admin@colegio-sanjose.edu.pe
```

Este comando:
1. Crea registro en tabla `tenants` (BD central)
2. Genera UUID automáticamente
3. Crea base de datos: `peepos_tenant_abc-123-uuid`
4. Ejecuta migraciones de tenant
5. Ejecuta seeders (opcional)

### Desde Código (TenantService)

```php
use App\Services\Tenancy\TenantService;

$tenantService = app(TenantService::class);

$tenant = $tenantService->createTenant([
    'tenant_code' => 'colegio-sanjose',
    'name' => 'Colegio San José',
    'domain' => 'colegio-sanjose',
    'email' => 'admin@colegio-sanjose.edu.pe',
    'phone' => '01-1234567',
    'ruc' => '20123456789',
]);

// Resultado:
// - Tenant creado con UUID
// - BD creada: peepos_tenant_{uuid}
// - Migraciones ejecutadas
// - Suscripción básica creada
```

---

## Migraciones

### Migraciones Centrales

Ejecutar en BD central:

```bash
php artisan migrate --path=database/migrations/central
```

Tablas: `tenants`, `subscriptions`, `users`

### Migraciones de Tenant

Ejecutar en TODAS las BDs de tenants:

```bash
php artisan tenants:migrate
```

Este comando:
- Itera sobre todos los tenants activos
- Ejecuta migraciones en cada BD de tenant
- Usa archivos de `database/migrations/tenant/`

Para un tenant específico:

```bash
php artisan tenants:migrate --tenants=abc-123-uuid
```

---

## Seeders

### Seed de BD Central

```bash
php artisan db:seed
```

### Seed de Tenants

```bash
php artisan tenants:seed
```

Para un tenant específico:

```bash
php artisan tenants:seed --tenants=abc-123-uuid --class=EstudiantesSeeder
```

---

## Conexión Manual a BD de Tenant

### En Controllers

```php
// Stancl/Tenancy maneja esto automáticamente vía middleware
// Pero si necesitas acceder manualmente:

tenancy()->initialize($tenant);

// Ahora todas las queries van a la BD del tenant
$estudiantes = Estudiante::all();

tenancy()->end();
```

### En Comandos Artisan

```php
use Stancl\Tenancy\Features\TenantCommand;

class MiComando extends Command
{
    use TenantCommand;

    public function handle()
    {
        $this->tenancy()->runForMultiple(Tenant::all(), function ($tenant) {
            $this->info("Procesando tenant: {$tenant->name}");

            // Código ejecutado en contexto de cada tenant
            $count = Estudiante::count();
            $this->info("  - Estudiantes: {$count}");
        });
    }
}
```

---

## Testing Multi-Tenancy

### Test de Aislamiento de Datos

```php
use Tests\TestCase;
use App\Models\Tenant\Tenant;

class TenantIsolationTest extends TestCase
{
    public function test_tenants_tienen_bases_de_datos_separadas()
    {
        // Crear dos tenants
        $tenant1 = Tenant::create([
            'tenant_code' => 'tenant1',
            'name' => 'Tenant 1',
            // ...
        ]);

        $tenant2 = Tenant::create([
            'tenant_code' => 'tenant2',
            'name' => 'Tenant 2',
            // ...
        ]);

        // Inicializar tenant1 y crear estudiante
        tenancy()->initialize($tenant1);
        $estudiante1 = Estudiante::create(['nombre' => 'Juan']);

        // Cambiar a tenant2
        tenancy()->end();
        tenancy()->initialize($tenant2);

        // Verificar que estudiante1 NO existe en tenant2
        $this->assertDatabaseMissing('estudiantes', ['nombre' => 'Juan']);
        $this->assertEquals(0, Estudiante::count());
    }
}
```

---

## Troubleshooting

### Error: "Tenant no identificado"

**Causa**: Falta header `X-Tenant-Code` o subdomain inválido.

**Solución**:
```bash
# Agregar header
curl -H "X-Tenant-Code: colegio-sanjose" ...

# O usar subdomain
https://colegio-sanjose.peepos.app/...
```

### Error: "Database does not exist"

**Causa**: BD del tenant no fue creada.

**Solución**:
```bash
# Crear BD manualmente
php artisan tenants:migrate --tenants=abc-123-uuid

# O recrear tenant completo
php artisan tenants:create ...
```

### Error: "Tenant ya existe"

**Causa**: Intentas crear tenant con `tenant_code` duplicado.

**Solución**:
- Usar código único
- Verificar con: `SELECT * FROM tenants WHERE tenant_code = 'xxx'`

---

## Monitoreo y Mantenimiento

### Listar Todos los Tenants

```bash
php artisan tenants:list
```

### Verificar Estado de Tenants

```bash
php artisan tenants:check
```

Muestra:
- Tenants activos vs suspendidos
- Suscripciones vencidas
- BDs que existen/faltan

### Eliminar Tenant

```bash
php artisan tenants:delete abc-123-uuid --force
```

**ADVERTENCIA**: Esto elimina:
- Registro del tenant
- Base de datos completa
- Archivos en storage

---

## Seguridad

### Checklist

- [ ] Middleware `tenant.identify` en TODAS las rutas de tenant
- [ ] Middleware `validate.ownership` para prevenir data leakage
- [ ] Logging de cambios de tenant en logs
- [ ] Rate limiting por tenant
- [ ] Backups diarios de cada BD de tenant

### Logs de Auditoría

Todas las inicializaciones de tenant se registran:

```json
{
    "level": "info",
    "message": "Tenant initialized",
    "context": {
        "tenant_id": "abc-123-uuid",
        "tenant_code": "colegio-sanjose",
        "user_id": 45,
        "ip": "192.168.1.100",
        "timestamp": "2025-01-11T21:30:00Z"
    }
}
```

---

## Referencias

- **Stancl/Tenancy Docs**: https://tenancyforlaravel.com/docs/
- **Configuración**: [config/tenancy.php](../backend/config/tenancy.php)
- **Middleware**: [TenantIdentification.php](../backend/app/Http/Middleware/TenantIdentification.php)
- **Modelo**: [Tenant.php](../backend/app/Models/Tenant/Tenant.php)
- **Seguridad**: [SECURITY.md](SECURITY.md)

---

**Última actualización**: Enero 2025
**Arquitectura**: Database per Tenant
**Estado**: ✅ CONFIGURADO
