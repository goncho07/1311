<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para registrar acciones de auditoria
 */
class AuditLog
{
    /**
     * Acciones que deben ser auditadas
     */
    protected array $auditActions = [
        'POST', 'PUT', 'PATCH', 'DELETE'
    ];

    /**
     * Rutas sensibles que siempre deben auditarse
     */
    protected array $sensitiveRoutes = [
        'api/v1/users',
        'api/v1/roles',
        'api/v1/permissions',
        'api/v1/subscriptions',
        'api/v1/tenants',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $response = $next($request);
        $executionTime = microtime(true) - $startTime;

        // Determinar si debe auditarse
        if ($this->shouldAudit($request)) {
            $this->logAudit($request, $response, $executionTime);
        }

        return $response;
    }

    /**
     * Determinar si la solicitud debe auditarse
     */
    protected function shouldAudit(Request $request): bool
    {
        // Auditar todas las acciones de modificación
        if (in_array($request->method(), $this->auditActions)) {
            return true;
        }

        // Auditar rutas sensibles
        foreach ($this->sensitiveRoutes as $route) {
            if (str_contains($request->path(), $route)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Registrar la auditoría
     */
    protected function logAudit(Request $request, Response $response, float $executionTime): void
    {
        $user = $request->user();
        $tenant = $request->attributes->get('tenant');

        $auditData = [
            'timestamp' => now()->toIso8601String(),
            'tenant_id' => $tenant?->id,
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_body' => $this->sanitizeData($request->all()),
            'response_status' => $response->getStatusCode(),
            'execution_time' => round($executionTime * 1000, 2) . 'ms',
        ];

        // Registrar en log
        Log::channel('audit')->info('Acción auditada', $auditData);

        // TODO: Guardar en base de datos para consultas futuras
        // DB::table('audit_logs')->insert($auditData);
    }

    /**
     * Sanitizar datos sensibles
     */
    protected function sanitizeData(array $data): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'secret', 'api_key'];

        foreach ($sensitiveKeys as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***REDACTED***';
            }
        }

        return $data;
    }
}
