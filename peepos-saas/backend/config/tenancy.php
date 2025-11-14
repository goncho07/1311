<?php

use Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper;
use Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper;
use Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper;
use Stancl\Tenancy\Bootstrappers\QueueTenancyBootstrapper;
use Stancl\Tenancy\Features\TenantConfig;
use Stancl\Tenancy\Features\TenantRedirect;
use Stancl\Tenancy\TenantDatabaseManagers\MySQLDatabaseManager;
use Stancl\Tenancy\UuidGenerator;

return [

    /*
    |--------------------------------------------------------------------------
    | Tenant Model
    |--------------------------------------------------------------------------
    |
    | Modelo que representa un tenant en el sistema
    |
    */

    'tenant_model' => \App\Models\Tenant\Tenant::class,

    /*
    |--------------------------------------------------------------------------
    | ID Generator
    |--------------------------------------------------------------------------
    |
    | Generador de IDs para tenants (UUID)
    |
    */

    'id_generator' => UuidGenerator::class,

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    |
    | 🔴 CRÍTICO: separate_database = true
    | Cada tenant tiene su propia base de datos
    |
    */

    'database' => [
        // Dominios centrales (no son tenants)
        'central_domains' => [
            env('CENTRAL_DOMAIN', 'peepos.app'),
            'localhost',
        ],

        // Conexión template para tenants
        'template_tenant_connection' => null,

        // Manager de base de datos
        'managers' => [
            'database' => MySQLDatabaseManager::class,
        ],

        // Prefijo para nombres de BD de tenants
        'prefix' => env('TENANCY_DATABASE_PREFIX', 'peepos_tenant_'),

        // Sufijo (vacío por defecto)
        'suffix' => '',

        // 🔴 CRÍTICO: Una base de datos separada por tenant
        'separate_database' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Domain Configuration
    |--------------------------------------------------------------------------
    */

    'domain_suffix' => env('TENANCY_DOMAIN_SUFFIX', '.peepos.app'),

    /*
    |--------------------------------------------------------------------------
    | Features
    |--------------------------------------------------------------------------
    |
    | Funcionalidades de Stancl/Tenancy a activar
    |
    */

    'features' => [
        TenantConfig::class,
        TenantRedirect::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Bootstrappers
    |--------------------------------------------------------------------------
    |
    | Bootstrappers que se ejecutan al inicializar un tenant
    |
    */

    'bootstrappers' => [
        DatabaseTenancyBootstrapper::class,
        CacheTenancyBootstrapper::class,
        FilesystemTenancyBootstrapper::class,
        QueueTenancyBootstrapper::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Identification
    |--------------------------------------------------------------------------
    |
    | Métodos para identificar el tenant en requests
    |
    */

    'identification' => [
        'header' => 'X-Tenant-Code',  // Header HTTP
        'subdomain' => true,           // Subdomain
        'query_parameter' => 'tenant_code', // Solo en dev/testing
    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Path
    |--------------------------------------------------------------------------
    */

    'migration_path' => database_path('migrations/tenant'),

    /*
    |--------------------------------------------------------------------------
    | Limits per Plan
    |--------------------------------------------------------------------------
    */

    'limits' => [
        'basic' => [
            'users' => 10,
            'students' => 100,
            'storage_gb' => 10,
        ],
        'standard' => [
            'users' => 50,
            'students' => 500,
            'storage_gb' => 50,
        ],
        'premium' => [
            'users' => 200,
            'students' => 2000,
            'storage_gb' => 200,
        ],
        'enterprise' => [
            'users' => 999,
            'students' => 10000,
            'storage_gb' => 1000,
        ],
    ],

];
