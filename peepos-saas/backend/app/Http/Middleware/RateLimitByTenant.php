<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rate limiting por tenant para prevenir abuso
 */
class RateLimitByTenant
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 60, int $decayMinutes = 1): Response
    {
        $tenant = $request->attributes->get('tenant');
        $user = $request->user();

        if (!$tenant) {
            return response()->json([
                'error' => 'Tenant no identificado',
            ], 400);
        }

        // Clave de rate limit: tenant_id + user_id + IP
        $key = sprintf(
            'rate_limit:%s:%s:%s',
            $tenant->id,
            $user?->id ?? 'guest',
            $request->ip()
        );

        // Verificar límite
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'error' => 'Demasiadas solicitudes',
                'message' => 'Ha excedido el límite de solicitudes. Intente de nuevo en ' . $seconds . ' segundos.',
                'retry_after' => $seconds,
            ], 429)->header('Retry-After', $seconds);
        }

        // Incrementar contador
        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Agregar headers de rate limit
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
            'X-RateLimit-Reset' => now()->addMinutes($decayMinutes)->timestamp,
        ]);

        return $response;
    }
}
