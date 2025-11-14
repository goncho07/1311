<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class RateLimitByTenant
{
    /**
     * Rate limiting por tenant (no global)
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 60, int $decayMinutes = 1)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'Tenant no identificado'], 400);
        }

        $key = "tenant_rate_limit:{$tenant->tenant_code}:" . $request->ip();

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'error' => 'Demasiadas solicitudes. Intente nuevamente en ' . $seconds . ' segundos.'
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        return $next($request);
    }
}
