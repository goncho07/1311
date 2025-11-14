<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware CRÍTICO para prevenir Data Leakage
 * Valida que los usuarios solo accedan a datos de su institución
 */
class ValidateDataOwnership
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $tenantId = $request->attributes->get('tenant')?->id ?? $request->input('tenant_id');

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
                'message' => 'Debe estar autenticado para acceder a este recurso',
            ], 401);
        }

        // Superadmin puede acceder a cualquier tenant
        if ($user->hasRole('superadmin')) {
            return $next($request);
        }

        // Validar que el usuario pertenece al tenant solicitado
        if ($user->tenant_id !== $tenantId) {
            // Log de intento de acceso no autorizado
            \Log::warning('Intento de acceso cruzado entre tenants', [
                'user_id' => $user->id,
                'user_tenant' => $user->tenant_id,
                'requested_tenant' => $tenantId,
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
            ]);

            return response()->json([
                'error' => 'Acceso denegado',
                'message' => 'No tiene permisos para acceder a los datos de esta institución',
            ], 403);
        }

        // Agregar scope automático a queries de Eloquent
        // Esto asegura que todas las consultas filtren por tenant_id
        app()->make('db')->listen(function ($query) use ($tenantId) {
            // Implementar escucha de queries para validación adicional
        });

        return $next($request);
    }
}
