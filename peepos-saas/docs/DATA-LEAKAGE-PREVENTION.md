# 🛡️ Protección Contra Data Leakage - Resumen Ejecutivo

## 3 Capas de Protección Crítica

Este documento resume las **3 capas de seguridad** implementadas en Peepos SaaS para prevenir el acceso cruzado entre instituciones (data leakage).

---

## 🔴 Capa 1: Trait `BelongsToTenant`
### Scope Global Automático en Modelos

```php
// 📁 backend/app/Traits/BelongsToTenant.php

use App\Traits\BelongsToTenant;

class Estudiante extends Model
{
    use BelongsToTenant;  // ✅ Protección automática
}
```

### ✅ Qué hace:
- Filtra **automáticamente** todas las queries por `tenant_id`
- Asigna `tenant_id` al crear nuevos registros
- Previene modificación del `tenant_id`

### ✅ Beneficio:
**Protección a nivel de base de datos**
Imposible hacer queries sin filtrar por tenant.

```php
// Automáticamente filtra por tenant_id del contexto
$estudiantes = Estudiante::all();

// Equivale a:
$estudiantes = Estudiante::where('tenant_id', $currentTenantId)->get();
```

---

## 🔴 Capa 2: Middleware `ValidateDataOwnership`
### Validación a Nivel de Request

```php
// 📁 backend/app/Http/Middleware/ValidateDataOwnership.php

Route::middleware([
    'auth:sanctum',
    'tenant.identify',
    'validate.ownership'  // ✅ Valida ownership
])->group(function () {
    // Rutas protegidas
});
```

### ✅ Qué hace:
- Compara `user->tenant_id` con `request->tenant_id`
- Bloquea si no coinciden
- Registra intentos maliciosos

### ✅ Beneficio:
**Protección a nivel de aplicación**
Usuarios solo acceden a datos de su institución.

```php
// Si usuario de tenant-abc intenta acceder a tenant-xyz:
❌ HTTP 403 Forbidden
📝 Log: "Intento de acceso cruzado detectado"
```

---

## 🔴 Capa 3: Middleware `TenantIdentification`
### Aislamiento de BD por Institución

```php
// 📁 backend/app/Http/Middleware/TenantIdentification.php

// Request con header:
X-Tenant-ID: tenant-abc-123

// O subdomain:
https://colegio-san-jose.peepos.com
```

### ✅ Qué hace:
- Identifica el tenant (header, subdomain, o query)
- Establece conexión a BD específica del tenant
- Valida que el tenant existe y está activo

### ✅ Beneficio:
**Aislamiento completo de datos**
Cada institución tiene su propia base de datos.

```
MySQL Server
├── peepos_central          (BD Central)
├── tenant_abc_123          (Colegio San José)
├── tenant_xyz_456          (Colegio Santa María)
└── tenant_def_789          (Colegio Salesiano)
```

---

## 🔄 Flujo Completo de Protección

### Request Normal ✅

```
┌─────────────────────────────────────────────────┐
│ 1. Request con X-Tenant-ID: tenant-abc-123     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. CAPA 3: TenantIdentification                │
│    ✅ Tenant identificado                       │
│    ✅ BD conectada: tenant_abc_123              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. CAPA 2: ValidateDataOwnership               │
│    ✅ Usuario pertenece a tenant-abc-123        │
│    ✅ Request para tenant-abc-123               │
│    ✅ Ownership válido                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. CAPA 1: BelongsToTenant                     │
│    ✅ Scope automático aplicado                 │
│    ✅ Query filtrada por tenant_id              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. ✅ Response con datos de tenant-abc-123     │
└─────────────────────────────────────────────────┘
```

### Intento de Acceso Cruzado ❌

```
┌─────────────────────────────────────────────────┐
│ 1. Request con X-Tenant-ID: tenant-xyz-456     │
│    Usuario autenticado: tenant-abc-123         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. CAPA 3: TenantIdentification                │
│    ✅ Tenant identificado: tenant-xyz-456       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. CAPA 2: ValidateDataOwnership               │
│    ❌ Usuario pertenece a: tenant-abc-123       │
│    ❌ Request intenta: tenant-xyz-456           │
│    🚨 ACCESO DENEGADO                          │
│    📝 Log registrado                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. ❌ HTTP 403 Forbidden                       │
│    "No tiene permisos para acceder a           │
│     los datos de esta institución"             │
└─────────────────────────────────────────────────┘
```

---

## 📊 Matriz de Protección

| Escenario | Capa 1 | Capa 2 | Capa 3 | Resultado |
|-----------|--------|--------|--------|-----------|
| **Request normal** | ✅ Filtra por tenant | ✅ Ownership OK | ✅ BD correcta | ✅ Acceso permitido |
| **Acceso cruzado intencional** | ✅ Filtraría si llega | ❌ Bloqueado aquí | ✅ Identificado | ❌ 403 Forbidden |
| **Sin header tenant** | ✅ Filtraría si llega | ✅ Validaría si llega | ❌ Bloqueado aquí | ❌ 400 Bad Request |
| **Tenant inactivo** | ✅ Filtraría si llega | ✅ Validaría si llega | ❌ Bloqueado aquí | ❌ 403 Forbidden |
| **Query sin scope** | ❌ Bloqueado aquí | N/A | N/A | ❌ SQL solo retorna del tenant |

---

## 🎯 Puntos Clave

### ✅ Protección en Múltiples Niveles

1. **BD (Capa 1)**: Scope automático en Eloquent
2. **App (Capa 2)**: Validación de ownership en middleware
3. **Infraestructura (Capa 3)**: BDs separadas por tenant

### 🔐 Principio de Defensa en Profundidad

Si una capa falla, las otras dos siguen protegiendo.

```
❌ Intentar bypasear Capa 1 (scope)
   → ❌ Capa 2 bloquea (ownership)
      → ❌ Capa 3 bloquea (BD incorrecta)
         → 🛡️ SISTEMA PROTEGIDO
```

### 📝 Logging y Auditoría

Todos los intentos de acceso cruzado quedan registrados:

```json
{
  "level": "warning",
  "message": "Intento de acceso cruzado",
  "user_id": 123,
  "user_tenant": "tenant-abc-123",
  "requested_tenant": "tenant-xyz-456",
  "ip": "192.168.1.100",
  "timestamp": "2025-01-11T21:30:00Z"
}
```

---

## 🧪 Validación de Seguridad

### Test 1: Scope Automático

```php
public function test_scope_filtra_por_tenant()
{
    // Crear estudiantes en 2 tenants
    Estudiante::factory()->create(['tenant_id' => 'abc']);
    Estudiante::factory()->create(['tenant_id' => 'xyz']);

    // Establecer contexto tenant-abc
    $this->actingAs($userDeTenantAbc);

    // Solo retorna estudiantes de tenant-abc
    $estudiantes = Estudiante::all();

    $this->assertCount(1, $estudiantes);
    $this->assertEquals('abc', $estudiantes->first()->tenant_id);
}
```

### Test 2: Validación de Ownership

```php
public function test_no_puede_acceder_a_otro_tenant()
{
    $userTenantAbc = User::factory()->create(['tenant_id' => 'abc']);

    // Intentar acceder a tenant-xyz
    $response = $this->actingAs($userTenantAbc)
        ->withHeaders(['X-Tenant-ID' => 'xyz'])
        ->get('/api/v1/director/estudiantes');

    $response->assertStatus(403);
    $response->assertJson([
        'error' => 'Acceso denegado'
    ]);
}
```

---

## ⚠️ Checklist de Implementación

### Para cada nuevo modelo:

- [ ] ✅ Agregar `use BelongsToTenant;`
- [ ] ✅ Agregar columna `tenant_id UUID` en migración
- [ ] ✅ Agregar índice en `tenant_id`
- [ ] ✅ Migración en carpeta `tenant/` (no `central/`)

### Para cada nueva ruta:

- [ ] ✅ Agregar middleware `tenant.identify`
- [ ] ✅ Agregar middleware `tenant.active`
- [ ] ✅ Agregar middleware `validate.ownership`
- [ ] ✅ Agregar middleware `role:xxx`

### ❌ NUNCA hacer:

```php
// ❌ Deshabilitar scope sin autorización
Estudiante::withoutGlobalScope('tenant')->get();

// ❌ Hardcodear tenant_id
Estudiante::where('tenant_id', 'abc')->get();

// ❌ Omitir middleware de validación
Route::get('/datos', [Controller::class, 'index']);
```

---

## 📚 Referencias Completas

- **[SECURITY.md](SECURITY.md)** - Documentación completa de seguridad
- **[BelongsToTenant.php](../backend/app/Traits/BelongsToTenant.php)** - Trait Capa 1
- **[ValidateDataOwnership.php](../backend/app/Http/Middleware/ValidateDataOwnership.php)** - Middleware Capa 2
- **[TenantIdentification.php](../backend/app/Http/Middleware/TenantIdentification.php)** - Middleware Capa 3

---

## 🚨 En Caso de Incidente

1. ✅ Revisar logs inmediatamente
2. ✅ Suspender usuario sospechoso
3. ✅ Notificar tenant afectado
4. ✅ Auditar accesos últimas 24h
5. ✅ Regenerar tokens
6. ✅ Documentar incidente

**Contacto de Seguridad**: security@peepos.com

---

**Última actualización**: Enero 2025
**Criticidad**: 🔴 MÁXIMA
**Estado**: ✅ IMPLEMENTADO
