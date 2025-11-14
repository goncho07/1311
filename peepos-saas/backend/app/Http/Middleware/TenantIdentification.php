<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant\Tenant;
use Stancl\Tenancy\Tenancy;

/**
 * Middleware CRÍTICO para identificar el tenant
 * Previene acceso cruzado entre instituciones
 *
 * Integrado con Stancl/Tenancy para database-per-tenant
 */
class TenantIdentification
{
    protected $tenancy;

    public function __construct(Tenancy $tenancy)
    {
        $this->tenancy = $tenancy;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Identificar tenant desde header personalizado
        $tenantCode = $request->header('X-Tenant-Code');

        if (!$tenantCode) {
            // Alternativa: desde subdomain
            $host = $request->getHost();
            $subdomain = explode('.', $host)[0] ?? null;
            $tenantCode = $subdomain !== 'www' && $subdomain !== 'api' ? $subdomain : null;
        }

        // Query parameter (solo en dev/testing)
        if (!$tenantCode && app()->environment('local', 'testing')) {
            $tenantCode = $request->query('tenant_code');
        }

        if (!$tenantCode) {
            return response()->json([
                'error' => 'Tenant no identificado',
                'message' => 'Debe incluir header X-Tenant-Code o usar un subdominio válido'
            ], 400);
        }

        // Buscar tenant en BD central
        $tenant = Tenant::where('tenant_code', $tenantCode)->first();

        if (!$tenant) {
            return response()->json([
                'error' => 'Institución no encontrada',
                'message' => "No existe una institución con código: {$tenantCode}"
            ], 404);
        }

        if ($tenant->estado !== 'ACTIVO') {
            return response()->json([
                'error' => 'Institución suspendida o inactiva',
                'message' => 'La institución no está disponible',
                'estado' => $tenant->estado
            ], 403);
        }

        // 🔴 CRÍTICO: Inicializar tenant con Stancl/Tenancy
        // Esto establece la conexión a la BD específica del tenant
        $this->tenancy->initialize($tenant);

        // Inyectar en request para uso posterior
        $request->attributes->set('tenant', $tenant);
        $request->merge(['tenant_id' => $tenant->id]);

        return $next($request);
    }
}
