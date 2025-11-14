# 🔒 Seguridad Multi-Tenant - Peepos SaaS

## 🔴 CRÍTICO: Prevención de Data Leakage

El sistema implementa **3 capas de protección** para prevenir el acceso cruzado entre instituciones (tenants). Estas capas son fundamentales para la seguridad del sistema SaaS.

---

## Capa 1: Trait `BelongsToTenant` - Scope Global Automático

### Descripción
Trait que debe usarse en **TODOS los modelos** que pertenecen a un tenant. Aplica automáticamente un scope global que filtra todas las queries por `tenant_id`.

### Ubicación
📁 `backend/app/Traits/BelongsToTenant.php`

### Cómo Funciona

```php
<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use BelongsToTenant; // 🔴 OBLIGATORIO en todos los modelos tenant

    // ... resto del modelo
}
```

### Protección Automática

1. **Filtrado Global**: Todas las queries se filtran automáticamente por `tenant_id`
   ```php
   // Sin hacer nada, esto ya filtra por tenant_id del contexto actual
   $estudiantes = Estudiante::all();

   // Es equivalente a:
   $estudiantes = Estudiante::where('tenant_id', $currentTenantId)->get();
   ```

2. **Auto-asignación**: Al crear registros, asigna automáticamente el `tenant_id`
   ```php
   // El tenant_id se asigna automáticamente
   $estudiante = Estudiante::create([
       'nombre' => 'Juan Pérez',
       'dni' => '12345678',
       // tenant_id NO es necesario especificarlo
   ]);
   ```

3. **Prevención de Modificaciones**: No permite modificar el `tenant_id` de registros existentes

### ⚠️ IMPORTANTE

- **NUNCA** usar `withoutGlobalScope('tenant')` a menos que seas superadmin
- **SIEMPRE** incluir este trait en modelos que pertenezcan a un tenant
- Modelos que **NO** deben usar este trait:
  - `Tenant` (BD central)
  - `Subscription` (BD central)
  - `User` (tiene su propia validación)

---

## Capa 2: Middleware `ValidateDataOwnership` - Validación a Nivel de Request

### Descripción
Middleware que valida que los usuarios **solo accedan a datos de su propia institución**. Registra intentos de acceso no autorizado.

### Ubicación
📁 `backend/app/Http/Middleware/ValidateDataOwnership.php`

### Cómo Funciona

```php
Route::middleware([
    'auth:sanctum',
    'tenant.identify',      // Identifica el tenant
    'validate.ownership'    // 🔴 CRÍTICO: Valida ownership
])->group(function () {
    // Rutas protegidas
});
```

### Protección a Nivel de Request

1. **Validación de Usuario vs Tenant**
   - Compara `user->tenant_id` con el `tenant_id` de la request
   - Bloquea si no coinciden

2. **Excepción para Superadmin**
   - Los superadmins pueden acceder a cualquier tenant
   - Útil para soporte y administración

3. **Logging de Intentos Maliciosos**
   ```php
   // Se registra automáticamente:
   [
       'user_id' => 123,
       'user_tenant' => 'tenant-abc',
       'requested_tenant' => 'tenant-xyz',  // ⚠️ Intento de acceso cruzado
       'ip' => '192.168.1.100',
       'url' => '/api/v1/director/estudiantes'
   ]
   ```

### Respuesta de Error

```json
{
    "error": "Acceso denegado",
    "message": "No tiene permisos para acceder a los datos de esta institución"
}
```

**HTTP Status**: `403 Forbidden`

---

## Capa 3: Middleware `TenantIdentification` - Aislamiento de BD

### Descripción
Identifica el tenant y establece la conexión a su base de datos específica, logrando aislamiento completo de datos.

### Ubicación
📁 `backend/app/Http/Middleware/TenantIdentification.php`

### Cómo Funciona

### Métodos de Identificación

1. **Header HTTP** (Recomendado para APIs)
   ```bash
   curl -H "X-Tenant-ID: tenant-abc-123" \
        https://api.peepos.com/v1/director/dashboard
   ```

2. **Subdomain** (Para web)
   ```
   https://colegio-salesiano.peepos.com
   # tenant_id se extrae del subdomain "colegio-salesiano"
   ```

3. **Query Parameter** (Solo desarrollo/testing)
   ```
   https://api.peepos.com/v1/dashboard?tenant_id=tenant-abc-123
   ```

### Aislamiento de Base de Datos

```php
// Una vez identificado el tenant:
config(['database.connections.tenant.database' => 'tenant_abc_123']);

// Todas las queries subsecuentes van a esa BD específica
DB::connection('tenant')->table('estudiantes')->get();
```

### Arquitectura de Bases de Datos

```
MySQL Server
├── peepos_central (BD Central)
│   ├── tenants
│   ├── subscriptions
│   └── users
├── tenant_abc_123 (Colegio San José)
│   ├── estudiantes
│   ├── docentes
│   └── asistencias
├── tenant_xyz_456 (Colegio Santa María)
│   ├── estudiantes
│   ├── docentes
│   └── asistencias
└── tenant_def_789 (Colegio Salesiano)
    ├── estudiantes
    ├── docentes
    └── asistencias
```

### Validaciones

1. **Tenant Existe**: Verifica que el tenant_id sea válido
2. **Tenant Activo**: Valida que la suscripción esté activa
3. **BD Existe**: Comprueba que la base de datos del tenant exista

### Respuesta de Error

```json
{
    "error": "Tenant no identificado",
    "message": "Debe proporcionar X-Tenant-ID header o usar un subdominio válido"
}
```

**HTTP Status**: `400 Bad Request`

---

## 🛡️ Flujo Completo de Protección

### Ejemplo: Director consultando estudiantes

```
1. Request recibida
   POST /api/v1/director/estudiantes
   Headers:
     - Authorization: Bearer <token>
     - X-Tenant-ID: tenant-abc-123

2. Middleware: TenantIdentification (Capa 3)
   ✅ Tenant identificado: tenant-abc-123
   ✅ Conexión establecida a BD: tenant_abc_123
   ✅ Tenant está activo

3. Middleware: ValidateDataOwnership (Capa 2)
   ✅ Usuario autenticado: user_id=45
   ✅ Usuario pertenece a tenant-abc-123
   ✅ Tenant de request coincide con tenant de usuario

4. Controller ejecuta query
   Estudiante::all()

5. Trait: BelongsToTenant (Capa 1)
   ✅ Scope global aplicado automáticamente
   ✅ Query ejecutada:
      SELECT * FROM estudiantes
      WHERE tenant_id = 'tenant-abc-123'

6. Response
   {
     "data": [
       { "id": 1, "nombre": "Juan", "tenant_id": "tenant-abc-123" },
       { "id": 2, "nombre": "María", "tenant_id": "tenant-abc-123" }
     ]
   }
```

### Intento de Acceso Malicioso

```
1. Request recibida
   POST /api/v1/director/estudiantes
   Headers:
     - Authorization: Bearer <token_de_otro_tenant>
     - X-Tenant-ID: tenant-xyz-456  ⚠️ Intento de acceso cruzado

2. Middleware: TenantIdentification
   ✅ Tenant identificado: tenant-xyz-456

3. Middleware: ValidateDataOwnership
   ❌ Usuario pertenece a: tenant-abc-123
   ❌ Request intenta acceder a: tenant-xyz-456
   ❌ ACCESO DENEGADO
   📝 Log registrado con IP, user_id, intento malicioso

4. Response
   {
     "error": "Acceso denegado",
     "message": "No tiene permisos para acceder a los datos de esta institución"
   }
   Status: 403 Forbidden
```

---

## ✅ Checklist de Implementación

### Para Desarrolladores

Al crear un nuevo modelo:

- [ ] Agregar `use BelongsToTenant;` en el modelo
- [ ] Agregar columna `tenant_id` en la migración (tipo: `uuid`)
- [ ] Agregar índice en `tenant_id` para performance
- [ ] Verificar que la tabla esté en BD tenant, no central

Al crear nuevas rutas:

- [ ] Agregar middleware `tenant.identify`
- [ ] Agregar middleware `tenant.active`
- [ ] Agregar middleware `validate.ownership`
- [ ] Agregar middleware `role:xxx` para control de acceso

Al hacer queries:

- [ ] **NUNCA** usar `withoutGlobalScope('tenant')` sin autorización
- [ ] **NUNCA** hardcodear `tenant_id` en queries
- [ ] Confiar en el scope automático del trait

---

## 🧪 Testing de Seguridad

### Test 1: Validar Scope Automático

```php
public function test_estudiantes_solo_del_tenant_actual()
{
    $tenant1 = Tenant::factory()->create();
    $tenant2 = Tenant::factory()->create();

    // Crear estudiantes en diferentes tenants
    Estudiante::factory()->create(['tenant_id' => $tenant1->id]);
    Estudiante::factory()->create(['tenant_id' => $tenant2->id]);

    // Establecer contexto de tenant1
    $this->actingAs($userDeTenant1);

    // Solo debe retornar estudiantes de tenant1
    $estudiantes = Estudiante::all();

    $this->assertCount(1, $estudiantes);
    $this->assertEquals($tenant1->id, $estudiantes->first()->tenant_id);
}
```

### Test 2: Prevención de Acceso Cruzado

```php
public function test_no_puede_acceder_a_datos_de_otro_tenant()
{
    $tenant1 = Tenant::factory()->create();
    $tenant2 = Tenant::factory()->create();

    $userDeTenant1 = User::factory()->create(['tenant_id' => $tenant1->id]);

    // Intentar acceder a datos de tenant2
    $response = $this->actingAs($userDeTenant1)
        ->withHeaders(['X-Tenant-ID' => $tenant2->id])
        ->get('/api/v1/director/estudiantes');

    $response->assertStatus(403);
}
```

---

## 📊 Monitoreo y Alertas

### Logs de Seguridad

Los intentos de acceso cruzado se registran en:
- `storage/logs/laravel.log`
- Google Cloud Logging (producción)

### Formato de Log

```json
{
    "level": "warning",
    "message": "Intento de acceso cruzado entre tenants",
    "context": {
        "user_id": 123,
        "user_email": "director@colegio1.com",
        "user_tenant": "tenant-abc-123",
        "requested_tenant": "tenant-xyz-456",
        "ip": "192.168.1.100",
        "url": "/api/v1/director/estudiantes",
        "method": "GET",
        "timestamp": "2025-01-11T21:30:00Z"
    }
}
```

### Alertas Automáticas

Configurar alertas en Google Cloud Monitoring cuando:
- Más de 5 intentos de acceso cruzado en 1 minuto
- Más de 10 intentos de acceso cruzado por usuario/día
- Acceso cruzado desde IP sospechosa

---

## 🚨 Incident Response

### Si se detecta acceso cruzado:

1. **Revisar logs** inmediatamente
2. **Suspender usuario** sospechoso
3. **Notificar al tenant afectado**
4. **Auditar accesos** del usuario en últimas 24h
5. **Regenerar tokens** del tenant afectado
6. **Documentar incidente** para análisis

---

## 📚 Referencias

- [Trait BelongsToTenant](../backend/app/Traits/BelongsToTenant.php)
- [Middleware ValidateDataOwnership](../backend/app/Http/Middleware/ValidateDataOwnership.php)
- [Middleware TenantIdentification](../backend/app/Http/Middleware/TenantIdentification.php)
- [TenantService](../backend/app/Services/Tenancy/TenantService.php)
- [Configuración Tenancy](../backend/config/tenancy.php)

---

## ⚠️ Advertencias Finales

### ❌ NUNCA hacer esto:

```php
// ❌ MAL: Deshabilitar scope sin validación
$estudiantes = Estudiante::withoutGlobalScope('tenant')->get();

// ❌ MAL: Hardcodear tenant_id
$estudiantes = Estudiante::where('tenant_id', 'tenant-abc-123')->get();

// ❌ MAL: No usar middleware de validación
Route::get('/estudiantes', [EstudianteController::class, 'index']);
```

### ✅ SIEMPRE hacer esto:

```php
// ✅ BIEN: Confiar en el scope automático
$estudiantes = Estudiante::all();

// ✅ BIEN: Usar middleware completo
Route::middleware(['tenant.identify', 'tenant.active', 'validate.ownership'])
    ->get('/estudiantes', [EstudianteController::class, 'index']);

// ✅ BIEN: Validar permisos adicionales
$this->authorize('view', $estudiante);
```

---

**Última actualización**: Enero 2025
**Responsable de Seguridad**: Equipo Peepos
**Contacto**: security@peepos.com
