<?php

namespace App\Services\Tenancy;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class TenantDatabaseManager
{
    /**
     * Crear base de datos para un tenant
     */
    public function createTenantDatabase(string $tenantId): void
    {
        $databaseName = $this->getTenantDatabaseName($tenantId);

        DB::statement("CREATE DATABASE IF NOT EXISTS `{$databaseName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

        \Log::info("Base de datos creada para tenant", [
            'tenant_id' => $tenantId,
            'database' => $databaseName,
        ]);
    }

    /**
     * Ejecutar migraciones en la BD del tenant
     */
    public function runTenantMigrations(string $tenantId): void
    {
        $databaseName = $this->getTenantDatabaseName($tenantId);

        // Configurar conexión temporal
        config([
            'database.connections.tenant.database' => $databaseName,
        ]);

        // Ejecutar migraciones de tenant
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        \Log::info("Migraciones ejecutadas para tenant", [
            'tenant_id' => $tenantId,
            'database' => $databaseName,
        ]);
    }

    /**
     * Seed datos iniciales del tenant
     */
    public function seedTenantData(string $tenantId): void
    {
        $databaseName = $this->getTenantDatabaseName($tenantId);

        config([
            'database.connections.tenant.database' => $databaseName,
        ]);

        Artisan::call('db:seed', [
            '--database' => 'tenant',
            '--class' => 'TenantSeeder',
            '--force' => true,
        ]);

        \Log::info("Datos iniciales insertados para tenant", [
            'tenant_id' => $tenantId,
        ]);
    }

    /**
     * Eliminar base de datos del tenant
     */
    public function deleteTenantDatabase(string $tenantId): void
    {
        $databaseName = $this->getTenantDatabaseName($tenantId);

        DB::statement("DROP DATABASE IF EXISTS `{$databaseName}`");

        \Log::warning("Base de datos eliminada para tenant", [
            'tenant_id' => $tenantId,
            'database' => $databaseName,
        ]);
    }

    /**
     * Crear backup de la BD del tenant
     */
    public function backupTenantDatabase(string $tenantId): string
    {
        $databaseName = $this->getTenantDatabaseName($tenantId);
        $backupPath = storage_path("backups/tenant_{$tenantId}_" . now()->format('Y-m-d_H-i-s') . ".sql");

        // TODO: Implementar backup usando mysqldump o similar

        return $backupPath;
    }

    /**
     * Restaurar backup de la BD del tenant
     */
    public function restoreTenantDatabase(string $tenantId, string $backupPath): void
    {
        // TODO: Implementar restore desde backup
    }

    /**
     * Obtener nombre de la BD del tenant
     */
    protected function getTenantDatabaseName(string $tenantId): string
    {
        $prefix = config('tenancy.database_prefix', 'tenant_');
        return $prefix . str_replace('-', '_', $tenantId);
    }

    /**
     * Verificar si la BD del tenant existe
     */
    public function tenantDatabaseExists(string $tenantId): bool
    {
        $databaseName = $this->getTenantDatabaseName($tenantId);

        $result = DB::select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [$databaseName]);

        return count($result) > 0;
    }
}
