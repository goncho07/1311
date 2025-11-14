<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Tenant\Tenant;
use App\Models\Estudiante;
use App\Services\Tenancy\TenantDatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Tests de Multi-Tenancy
 *
 * Verifica que el sistema de multi-tenancy funcione correctamente:
 * - Identificación de tenant desde header
 * - Aislamiento de datos entre tenants
 * - Prevención de acceso cruzado
 * - Estados de tenant (activo, suspendido)
 */
class MultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant1;
    protected $tenant2;
    protected $dbManager;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear dos tenants de prueba
        $this->tenant1 = Tenant::factory()->create([
            'tenant_code' => 'test-colegio-1',
            'nombre' => 'Colegio Test 1',
            'estado' => 'ACTIVO',
            'plan' => 'BASICO'
        ]);

        $this->tenant2 = Tenant::factory()->create([
            'tenant_code' => 'test-colegio-2',
            'nombre' => 'Colegio Test 2',
            'estado' => 'ACTIVO',
            'plan' => 'PREMIUM'
        ]);

        // Crear sus bases de datos
        $this->dbManager = app(TenantDatabaseManager::class);
        $this->dbManager->createTenantDatabase($this->tenant1);
        $this->dbManager->createTenantDatabase($this->tenant2);
    }

    protected function tearDown(): void
    {
        // Limpiar bases de datos de tenants
        if (isset($this->dbManager)) {
            $this->dbManager->dropTenantDatabase($this->tenant1);
            $this->dbManager->dropTenantDatabase($this->tenant2);
        }

        parent::tearDown();
    }

    /** @test */
    public function tenant_identification_works_from_header()
    {
        $response = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant1->tenant_code,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response->assertStatus(200);

        // Verificar que el tenant fue identificado correctamente
        $this->assertEquals($this->tenant1->id, tenancy()->tenant?->id);
    }

    /** @test */
    public function missing_tenant_header_returns_error()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response->assertStatus(400);
        $response->assertJson([
            'message' => 'Tenant no especificado'
        ]);
    }

    /** @test */
    public function invalid_tenant_code_returns_error()
    {
        $response = $this->withHeaders([
            'X-Tenant-Code' => 'invalid-tenant-code',
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response->assertStatus(404);
        $response->assertJson([
            'message' => 'Tenant no encontrado'
        ]);
    }

    /** @test */
    public function cannot_access_other_tenant_data()
    {
        // Crear estudiante en tenant 1
        tenancy()->initialize($this->tenant1);
        $estudiante = Estudiante::factory()->create([
            'nombres' => 'Juan',
            'apellido_paterno' => 'Pérez',
        ]);
        $estudianteId = $estudiante->id;
        tenancy()->end();

        // Intentar acceder desde tenant 2
        $response = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant2->tenant_code,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get("/api/v1/director/estudiantes/{$estudianteId}");

        // Debe retornar 404 (no encontrado) porque está en otra BD
        $response->assertStatus(404);
    }

    /** @test */
    public function tenant_database_isolation_works()
    {
        // Crear datos en tenant 1
        tenancy()->initialize($this->tenant1);
        Estudiante::factory()->count(10)->create();
        $count1 = Estudiante::count();
        tenancy()->end();

        // Crear datos en tenant 2
        tenancy()->initialize($this->tenant2);
        Estudiante::factory()->count(5)->create();
        $count2 = Estudiante::count();
        tenancy()->end();

        // Verificar aislamiento completo
        $this->assertEquals(10, $count1);
        $this->assertEquals(5, $count2);

        // Verificar nuevamente que los datos persisten
        tenancy()->initialize($this->tenant1);
        $this->assertEquals(10, Estudiante::count());
        tenancy()->end();

        tenancy()->initialize($this->tenant2);
        $this->assertEquals(5, Estudiante::count());
        tenancy()->end();
    }

    /** @test */
    public function suspended_tenant_cannot_access_api()
    {
        // Suspender tenant
        $this->tenant1->update(['estado' => 'SUSPENDIDO']);

        $response = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant1->tenant_code,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'El tenant está suspendido'
        ]);
    }

    /** @test */
    public function expired_tenant_cannot_access_api()
    {
        // Expirar tenant
        $this->tenant1->update([
            'fecha_expiracion' => now()->subDays(1)
        ]);

        $response = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant1->tenant_code,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'La suscripción ha expirado'
        ]);
    }

    /** @test */
    public function tenant_can_only_access_features_from_their_plan()
    {
        // Tenant con plan básico no debe acceder a features premium
        $response = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant1->tenant_code, // Plan BASICO
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/analytics/advanced');

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Esta funcionalidad requiere plan Premium'
        ]);

        // Tenant con plan premium sí debe acceder
        $response = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant2->tenant_code, // Plan PREMIUM
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/analytics/advanced');

        $response->assertStatus(200);
    }

    /** @test */
    public function tenant_connection_switches_correctly_between_requests()
    {
        // Request a tenant 1
        $response1 = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant1->tenant_code,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response1->assertStatus(200);

        // Request a tenant 2
        $response2 = $this->withHeaders([
            'X-Tenant-Code' => $this->tenant2->tenant_code,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ])->get('/api/v1/director/dashboard');

        $response2->assertStatus(200);

        // Verificar que no hay contaminación de datos
        $this->assertNotEquals($response1->json(), $response2->json());
    }
}
