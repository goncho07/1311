<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Indica si se debe usar migraciones por defecto
     */
    protected bool $seed = false;

    /**
     * Setup común para todos los tests
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Configurar base de datos en memoria para tests
        $this->artisan('migrate:fresh');

        // Seed si está habilitado
        if ($this->seed) {
            $this->artisan('db:seed');
        }
    }

    /**
     * Crear un token de autenticación válido para tests
     */
    protected function getAuthToken(array $claims = []): string
    {
        $defaultClaims = [
            'sub' => 1,
            'email' => 'test@example.com',
            'role' => 'DIRECTOR',
            'tenant_id' => 1,
            'exp' => time() + 3600
        ];

        $claims = array_merge($defaultClaims, $claims);

        // Aquí deberías usar tu método real de generación de tokens
        // Por ahora retornamos un token de ejemplo
        return 'test-token-' . md5(json_encode($claims));
    }

    /**
     * Helper para requests autenticados con tenant
     */
    protected function authenticatedRequest(
        string $method,
        string $uri,
        string $tenantCode,
        array $data = [],
        array $headers = []
    ) {
        $defaultHeaders = [
            'X-Tenant-Code' => $tenantCode,
            'Authorization' => 'Bearer ' . $this->getAuthToken(),
            'Accept' => 'application/json',
        ];

        return $this->json(
            $method,
            $uri,
            $data,
            array_merge($defaultHeaders, $headers)
        );
    }

    /**
     * Assert que la respuesta tiene la estructura de paginación correcta
     */
    protected function assertPaginatedResponse($response, int $expectedCount = null): void
    {
        $response->assertJsonStructure([
            'data',
            'meta' => [
                'current_page',
                'total',
                'per_page',
                'last_page',
            ],
            'links' => [
                'first',
                'last',
                'prev',
                'next',
            ],
        ]);

        if ($expectedCount !== null) {
            $response->assertJsonCount($expectedCount, 'data');
        }
    }

    /**
     * Assert que la respuesta tiene la estructura de error estándar
     */
    protected function assertErrorResponse($response, int $statusCode, string $message = null): void
    {
        $response->assertStatus($statusCode);
        $response->assertJsonStructure([
            'message',
            'errors' => []
        ]);

        if ($message !== null) {
            $response->assertJson([
                'message' => $message
            ]);
        }
    }
}
