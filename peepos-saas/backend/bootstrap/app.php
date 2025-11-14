<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Registrar middleware globales
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Aliases de middleware
        $middleware->alias([
            'tenant.identify' => \App\Http\Middleware\TenantIdentification::class,
            'tenant.active' => \App\Http\Middleware\EnsureTenantIsActive::class,
            'validate.ownership' => \App\Http\Middleware\ValidateDataOwnership::class,
            'role' => \App\Http\Middleware\CheckRolePermission::class,
            'rate.tenant' => \App\Http\Middleware\RateLimitByTenant::class,
            'audit' => \App\Http\Middleware\AuditLog::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
