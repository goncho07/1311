<?php

namespace App\Services\Tenancy;

use App\Models\Tenant\Tenant;
use App\Models\Tenant\Subscription;
use App\Services\Tenancy\TenantDatabaseManager;
use Illuminate\Support\Str;

class TenantService
{
    protected TenantDatabaseManager $databaseManager;

    public function __construct(TenantDatabaseManager $databaseManager)
    {
        $this->databaseManager = $databaseManager;
    }

    /**
     * Crear nuevo tenant con su base de datos
     */
    public function createTenant(array $data): Tenant
    {
        \DB::beginTransaction();

        try {
            // Crear registro del tenant
            $tenant = Tenant::create([
                'id' => Str::uuid(),
                'name' => $data['name'],
                'domain' => $data['domain'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'ruc' => $data['ruc'] ?? null,
                'status' => 'active',
                'settings' => [
                    'timezone' => 'America/Lima',
                    'locale' => 'es',
                    'director_name' => $data['director_name'],
                    'director_email' => $data['director_email'],
                ],
            ]);

            // Crear base de datos del tenant
            $this->databaseManager->createTenantDatabase($tenant->id);

            // Ejecutar migraciones en la BD del tenant
            $this->databaseManager->runTenantMigrations($tenant->id);

            // Crear suscripción inicial
            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'plan' => $data['plan'],
                'billing_cycle' => 'monthly',
                'amount' => $this->getPlanAmount($data['plan']),
                'status' => 'trial',
                'start_date' => now(),
                'end_date' => now()->addDays(30), // Trial de 30 días
                'max_users' => $this->getPlanMaxUsers($data['plan']),
                'max_students' => $this->getPlanMaxStudents($data['plan']),
                'max_storage_gb' => $this->getPlanMaxStorage($data['plan']),
            ]);

            // Crear usuario director/administrador
            $this->createDirectorUser($tenant, $data);

            // Seed datos iniciales del tenant
            $this->databaseManager->seedTenantData($tenant->id);

            \DB::commit();

            return $tenant->load('subscription');

        } catch (\Exception $e) {
            \DB::rollBack();

            // Limpiar BD si se creó
            if (isset($tenant)) {
                $this->databaseManager->deleteTenantDatabase($tenant->id);
            }

            throw $e;
        }
    }

    /**
     * Crear usuario director del tenant
     */
    protected function createDirectorUser(Tenant $tenant, array $data): void
    {
        $user = \App\Models\User::create([
            'name' => $data['director_name'],
            'email' => $data['director_email'],
            'password' => \Hash::make(Str::random(16)), // Password temporal
            'role' => 'director',
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]);

        $user->assignRole('director');

        // TODO: Enviar email con credenciales
    }

    /**
     * Suspender tenant
     */
    public function suspendTenant(Tenant $tenant): void
    {
        $tenant->update(['status' => 'suspended']);

        // Revocar todos los tokens activos
        \App\Models\User::where('tenant_id', $tenant->id)
            ->get()
            ->each(fn($user) => $user->tokens()->delete());
    }

    /**
     * Reactivar tenant
     */
    public function activateTenant(Tenant $tenant): void
    {
        $tenant->update(['status' => 'active']);
    }

    /**
     * Eliminar tenant (soft delete)
     */
    public function deleteTenant(Tenant $tenant): void
    {
        $tenant->update(['status' => 'cancelled']);
        $tenant->delete();

        // La BD física se mantiene por 90 días antes de eliminarla
    }

    /**
     * Obtener precio del plan
     */
    protected function getPlanAmount(string $plan): float
    {
        return match($plan) {
            'basic' => 99.00,
            'standard' => 199.00,
            'premium' => 399.00,
            'enterprise' => 799.00,
            default => 0.00,
        };
    }

    /**
     * Obtener límite de usuarios por plan
     */
    protected function getPlanMaxUsers(string $plan): int
    {
        return match($plan) {
            'basic' => 10,
            'standard' => 50,
            'premium' => 200,
            'enterprise' => 999,
            default => 5,
        };
    }

    /**
     * Obtener límite de estudiantes por plan
     */
    protected function getPlanMaxStudents(string $plan): int
    {
        return match($plan) {
            'basic' => 100,
            'standard' => 500,
            'premium' => 2000,
            'enterprise' => 10000,
            default => 50,
        };
    }

    /**
     * Obtener límite de almacenamiento por plan (GB)
     */
    protected function getPlanMaxStorage(string $plan): int
    {
        return match($plan) {
            'basic' => 10,
            'standard' => 50,
            'premium' => 200,
            'enterprise' => 1000,
            default => 5,
        };
    }
}
