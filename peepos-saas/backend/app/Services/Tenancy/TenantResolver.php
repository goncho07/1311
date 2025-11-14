<?php

namespace App\Services\Tenancy;

use App\Models\Tenant\Tenant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class TenantResolver
{
    /**
     * Resuelve el tenant actual desde el dominio/subdominio
     */
    public function resolveFromRequest(Request $request): ?Tenant
    {
        $host = $request->getHost();

        // Intentar obtener desde cache
        $cacheKey = "tenant_domain_{$host}";

        return Cache::remember($cacheKey, 3600, function () use ($host) {
            // Buscar por dominio personalizado
            $tenant = Tenant::whereHas('domains', function ($query) use ($host) {
                $query->where('domain', $host);
            })->first();

            // Si no encuentra, buscar por subdominio
            if (!$tenant) {
                $subdomain = $this->extractSubdomain($host);
                if ($subdomain) {
                    $tenant = Tenant::where('tenant_code', $subdomain)->first();
                }
            }

            return $tenant;
        });
    }

    /**
     * Extrae el subdominio del host
     */
    protected function extractSubdomain(string $host): ?string
    {
        $parts = explode('.', $host);

        // Si tiene más de 2 partes, el primero es el subdominio
        if (count($parts) > 2) {
            return $parts[0];
        }

        return null;
    }

    /**
     * Resuelve tenant desde tenant_code
     */
    public function resolveFromCode(string $tenantCode): ?Tenant
    {
        return Cache::remember("tenant_code_{$tenantCode}", 3600, function () use ($tenantCode) {
            return Tenant::where('tenant_code', $tenantCode)
                         ->where('estado', 'ACTIVO')
                         ->first();
        });
    }

    /**
     * Resuelve tenant desde UUID
     */
    public function resolveFromUuid(string $uuid): ?Tenant
    {
        return Cache::remember("tenant_uuid_{$uuid}", 3600, function () use ($uuid) {
            return Tenant::where('uuid', $uuid)->first();
        });
    }

    /**
     * Limpia cache de tenant
     */
    public function clearCache(Tenant $tenant): void
    {
        $keys = [
            "tenant_uuid_{$tenant->uuid}",
            "tenant_code_{$tenant->tenant_code}",
        ];

        // Limpiar cache de dominios
        foreach ($tenant->domains as $domain) {
            $keys[] = "tenant_domain_{$domain->domain}";
        }

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Verifica si el tenant es válido y activo
     */
    public function isValid(Tenant $tenant): bool
    {
        if ($tenant->estado !== 'ACTIVO') {
            return false;
        }

        // Verificar suscripción válida
        $subscription = $tenant->activeSubscription;

        if (!$subscription) {
            return false;
        }

        if ($subscription->fecha_fin->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Obtiene el tenant actual desde el contexto
     */
    public function current(): ?Tenant
    {
        return app('tenant');
    }

    /**
     * Establece el tenant actual en el contenedor
     */
    public function setCurrentTenant(Tenant $tenant): void
    {
        app()->instance('tenant', $tenant);
    }
}
