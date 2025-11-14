<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ValidateDataOwnership
{
    /**
     * 🔴 CRÍTICO: Valida que el recurso solicitado pertenece al tenant actual
     *
     * Previene data leakage entre instituciones
     */
    public function handle(Request $request, Closure $next, string $resourceType)
    {
        $resourceId = $request->route('id') ?? $request->route('estudiante') ?? $request->route('docente');

        if (!$resourceId) {
            return $next($request); // No hay recurso específico a validar
        }

        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'Tenant no identificado'], 400);
        }

        // Verificar ownership según tipo de recurso
        $belongs = match($resourceType) {
            'estudiante' => $this->validateEstudiante($resourceId, $tenant),
            'docente' => $this->validateDocente($resourceId, $tenant),
            'matricula' => $this->validateMatricula($resourceId, $tenant),
            'evaluacion' => $this->validateEvaluacion($resourceId, $tenant),
            'inventario' => $this->validateInventario($resourceId, $tenant),
            'transaccion' => $this->validateTransaccion($resourceId, $tenant),
            default => true // Por defecto permite (para recursos no sensibles)
        };

        if (!$belongs) {
            \Log::warning("Intento de acceso a recurso de otro tenant", [
                'usuario_id' => auth()->id(),
                'tenant_code' => $tenant->tenant_code,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'error' => 'Acceso denegado: el recurso no pertenece a su institución'
            ], 403);
        }

        return $next($request);
    }

    protected function validateEstudiante($id, $tenant): bool
    {
        // La conexión ya está configurada al tenant correcto por TenantIdentification
        // Solo verificamos que exista
        return DB::connection('tenant')->table('estudiantes')->where('id', $id)->exists();
    }

    protected function validateDocente($id, $tenant): bool
    {
        return DB::connection('tenant')->table('docentes')->where('id', $id)->exists();
    }

    protected function validateMatricula($id, $tenant): bool
    {
        return DB::connection('tenant')->table('matriculas')->where('id', $id)->exists();
    }

    protected function validateEvaluacion($id, $tenant): bool
    {
        return DB::connection('tenant')->table('evaluaciones')->where('id', $id)->exists();
    }

    protected function validateInventario($id, $tenant): bool
    {
        return DB::connection('tenant')->table('inventario_institucional')->where('id', $id)->exists();
    }

    protected function validateTransaccion($id, $tenant): bool
    {
        return DB::connection('tenant')->table('transacciones_financieras')->where('id', $id)->exists();
    }
}
