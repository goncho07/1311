<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware CRÍTICO para validar estado de suscripción
 * Bloquea acceso a tenants suspendidos o con suscripción vencida
 */
class EnsureTenantIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json([
                'error' => 'Tenant no identificado',
            ], 400);
        }

        // Verificar estado del tenant
        if ($tenant->status !== 'active') {
            $message = match($tenant->status) {
                'suspended' => 'Su institución ha sido suspendida. Contacte a soporte.',
                'cancelled' => 'Su suscripción ha sido cancelada.',
                'trial_expired' => 'Su período de prueba ha expirado.',
                default => 'Su institución no está activa.',
            };

            return response()->json([
                'error' => 'Institución no activa',
                'message' => $message,
                'status' => $tenant->status,
                'support_email' => 'soporte@peepos.com',
            ], 403);
        }

        // Verificar suscripción activa
        $subscription = $tenant->subscription;

        if (!$subscription) {
            return response()->json([
                'error' => 'Sin suscripción',
                'message' => 'No se encontró una suscripción activa para su institución.',
            ], 403);
        }

        if ($subscription->status !== 'active') {
            return response()->json([
                'error' => 'Suscripción inactiva',
                'message' => 'Su suscripción no está activa. Por favor renueve su plan.',
                'subscription_status' => $subscription->status,
                'end_date' => $subscription->end_date,
            ], 403);
        }

        // Verificar fecha de vencimiento
        if ($subscription->end_date && $subscription->end_date->isPast()) {
            return response()->json([
                'error' => 'Suscripción vencida',
                'message' => 'Su suscripción ha vencido. Por favor renueve su plan.',
                'end_date' => $subscription->end_date,
            ], 403);
        }

        return $next($request);
    }
}
