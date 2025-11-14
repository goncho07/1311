<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración CORS optimizada para producción multi-tenant.
    | Permite requests desde múltiples dominios incluyendo Firebase Hosting,
    | dominios custom y subdominios.
    |
    */

    // Rutas que permiten CORS
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
    ],

    // Métodos HTTP permitidos
    'allowed_methods' => ['*'],

    // Origenes permitidos
    'allowed_origins' => array_filter([
        // Production domains
        'https://peepos.app',
        'https://app.peepos.app',

        // Firebase Hosting
        'https://peepos-saas.web.app',
        'https://peepos-saas.firebaseapp.com',

        // Development/Local
        env('APP_ENV') === 'local' ? 'http://localhost:5173' : null,
        env('APP_ENV') === 'local' ? 'http://localhost:3000' : null,
        env('APP_ENV') === 'local' ? 'http://127.0.0.1:5173' : null,

        // Custom origins from env
        ...array_filter(
            explode(',', env('CORS_ALLOWED_ORIGINS', '')),
            fn($origin) => !empty(trim($origin))
        ),
    ]),

    // Patrones de origenes permitidos (para subdominios dinámicos)
    'allowed_origins_patterns' => [
        // Permitir todos los subdominios de peepos.app
        '/^https:\/\/.*\.peepos\.app$/',

        // Permitir preview URLs de Firebase Hosting
        '/^https:\/\/peepos-saas--.*\.web\.app$/',

        // Permitir Cloud Run preview URLs
        '/^https:\/\/peepos-api-.*\.run\.app$/',
    ],

    // Headers permitidos en requests
    'allowed_headers' => [
        '*',
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
        'X-Tenant-Code',
        'X-Tenant-ID',
        'X-API-Key',
        'Accept',
        'Origin',
        'User-Agent',
    ],

    // Headers expuestos en responses (para que el frontend pueda leerlos)
    'exposed_headers' => [
        // Rate limiting headers
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',

        // Pagination headers
        'X-Total-Count',
        'X-Page',
        'X-Per-Page',
        'X-Total-Pages',

        // Multi-tenancy headers
        'X-Tenant-Code',
        'X-Tenant-Name',

        // Request tracking
        'X-Request-Id',

        // API versioning
        'X-API-Version',
    ],

    // Max age de la cache preflight (en segundos)
    // 1 hora para reducir requests OPTIONS
    'max_age' => 3600,

    // Permitir cookies y credenciales
    'supports_credentials' => true,

];
