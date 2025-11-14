<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\RegistroActividad;

class AuditLog
{
    /**
     * Registra todas las acciones en audit log
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Solo auditar operaciones de escritura
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    protected function logActivity(Request $request, $response): void
    {
        try {
            RegistroActividad::create([
                'usuario_id' => auth()->id() ?? 0,
                'accion' => $this->determinarAccion($request),
                'modulo' => $this->determinarModulo($request),
                'entidad_tipo' => $this->extractEntityType($request),
                'entidad_id' => $this->extractEntityId($request),
                'descripcion' => $this->generarDescripcion($request),
                'datos_anteriores' => $this->extractOldData($request),
                'datos_nuevos' => $request->except(['password', 'password_confirmation']),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error registrando actividad: ' . $e->getMessage());
        }
    }

    protected function determinarAccion(Request $request): string
    {
        return match($request->method()) {
            'POST' => 'CREAR',
            'PUT', 'PATCH' => 'ACTUALIZAR',
            'DELETE' => 'ELIMINAR',
            default => 'OTRO'
        };
    }

    protected function determinarModulo(Request $request): string
    {
        $path = $request->path();

        if (str_contains($path, 'estudiantes')) return 'USUARIOS';
        if (str_contains($path, 'matriculas')) return 'MATRICULA';
        if (str_contains($path, 'evaluaciones')) return 'ACADEMICO';
        if (str_contains($path, 'asistencias')) return 'ASISTENCIA';
        if (str_contains($path, 'inventario')) return 'RECURSOS';
        if (str_contains($path, 'transacciones')) return 'FINANZAS';

        return 'GENERAL';
    }

    protected function extractEntityType(Request $request): ?string
    {
        $path = $request->path();

        if (str_contains($path, 'estudiantes')) return 'Estudiante';
        if (str_contains($path, 'docentes')) return 'Docente';
        if (str_contains($path, 'matriculas')) return 'Matricula';
        if (str_contains($path, 'evaluaciones')) return 'Evaluacion';
        if (str_contains($path, 'asistencias')) return 'Asistencia';
        if (str_contains($path, 'inventario')) return 'Inventario';
        if (str_contains($path, 'transacciones')) return 'Transaccion';

        return null;
    }

    protected function extractEntityId(Request $request): ?int
    {
        // Intentar obtener el ID de la ruta
        $id = $request->route('id') ??
              $request->route('estudiante') ??
              $request->route('docente') ??
              $request->route('matricula') ??
              $request->route('evaluacion');

        return $id ? (int) $id : null;
    }

    protected function generarDescripcion(Request $request): string
    {
        $accion = $this->determinarAccion($request);
        $entidad = $this->extractEntityType($request) ?? 'recurso';
        $id = $this->extractEntityId($request);

        if ($id) {
            return "{$accion} {$entidad} #{$id}";
        }

        return "{$accion} {$entidad}";
    }

    protected function extractOldData(Request $request): ?array
    {
        // Para actualizaciones y eliminaciones, intentar obtener datos anteriores
        if (!in_array($request->method(), ['PUT', 'PATCH', 'DELETE'])) {
            return null;
        }

        $id = $this->extractEntityId($request);
        if (!$id) {
            return null;
        }

        // Aquí podrías implementar lógica para obtener los datos anteriores
        // de la base de datos antes de la actualización
        // Por ahora retornamos null para evitar complejidad adicional

        return null;
    }
}
