<?php

namespace App\Services\Asistencia;

use App\Models\Asistencia;
use App\Models\Estudiante;
use App\Models\Matricula;
use App\Services\Whatsapp\WAHAService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AsistenciaService
{
    protected WAHAService $wahaService;

    public function __construct(WAHAService $wahaService)
    {
        $this->wahaService = $wahaService;
    }
    /**
     * Registrar asistencia manual
     */
    public function registrarAsistencia(array $data): Asistencia
    {
        try {
            // Verificar si ya existe registro para esta fecha
            $existente = Asistencia::where('estudiante_id', $data['estudiante_id'])
                                   ->whereDate('fecha', $data['fecha'] ?? now())
                                   ->first();

            if ($existente) {
                // Actualizar registro existente
                $existente->update([
                    'estado' => $data['estado'],
                    'observaciones' => $data['observaciones'] ?? null,
                    'justificacion' => $data['justificacion'] ?? null,
                ]);
                return $existente;
            }

            // Crear nuevo registro
            $asistencia = Asistencia::create([
                'uuid' => \Str::uuid(),
                'estudiante_id' => $data['estudiante_id'],
                'periodo_academico_id' => $data['periodo_academico_id'],
                'fecha' => $data['fecha'] ?? now(),
                'hora_registro' => now(),
                'tipo' => $data['tipo'] ?? 'DIARIA',
                'estado' => $data['estado'],
                'observaciones' => $data['observaciones'] ?? null,
                'registrado_por' => auth()->id(),
                'metodo_registro' => 'MANUAL'
            ]);

            Log::info("Asistencia registrada", ['asistencia_id' => $asistencia->id]);

            // 📲 Enviar notificación WhatsApp a apoderados (asíncrono)
            try {
                $this->notificarApoderados($asistencia);
            } catch (\Exception $e) {
                // No fallar si la notificación falla, solo logear
                Log::warning("Error al notificar apoderados vía WhatsApp: " . $e->getMessage());
            }

            return $asistencia;

        } catch (\Exception $e) {
            Log::error("Error registrando asistencia: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 📲 Notificar a apoderados vía WhatsApp sobre asistencia
     */
    protected function notificarApoderados(Asistencia $asistencia): void
    {
        // Obtener estudiante con apoderados
        $estudiante = Estudiante::with(['apoderados', 'matriculas' => function($q) {
            $q->where('estado', 'ACTIVA')->latest();
        }])->find($asistencia->estudiante_id);

        if (!$estudiante || !$estudiante->apoderados || $estudiante->apoderados->isEmpty()) {
            return;
        }

        // Obtener matrícula activa para determinar nivel educativo
        $matriculaActiva = $estudiante->matriculas->first();
        if (!$matriculaActiva) {
            return;
        }

        // Determinar nivel educativo (inicial, primaria, secundaria)
        $nivelEducativo = $this->determinarNivelEducativo($matriculaActiva->grado);

        // Preparar datos de apoderados
        $apoderados = $estudiante->apoderados->map(function($apoderado) {
            return [
                'nombre' => $apoderado->nombre_completo,
                'telefono' => $apoderado->telefono_principal ?? $apoderado->telefono_secundario,
            ];
        })->filter(function($apoderado) {
            return !empty($apoderado['telefono']);
        })->toArray();

        // Preparar datos del estudiante
        $datosEstudiante = [
            'nombre_estudiante' => $estudiante->nombre_completo,
            'codigo' => $estudiante->codigo_estudiante,
            'fecha' => $asistencia->fecha->format('d/m/Y'),
            'hora' => $asistencia->hora_registro?->format('H:i') ?? now()->format('H:i'),
            'estado' => $asistencia->estado,
        ];

        // Enviar notificación vía WAHA
        $this->wahaService->notificarAsistencia($nivelEducativo, $apoderados, $datosEstudiante);
    }

    /**
     * Determinar nivel educativo según el grado
     */
    protected function determinarNivelEducativo(string $grado): string
    {
        // Inicial: 3, 4, 5 años
        if (in_array($grado, ['3 años', '4 años', '5 años'])) {
            return 'inicial';
        }

        // Primaria: 1° a 6° grado
        if (in_array($grado, ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'])) {
            return 'primaria';
        }

        // Secundaria: 1° a 5° año
        return 'secundaria';
    }

    /**
     * Registrar asistencia mediante código QR
     */
    public function registrarPorQR(string $codigoQr, int $estudianteId): Asistencia
    {
        try {
            $asistencia = $this->registrarAsistencia([
                'estudiante_id' => $estudianteId,
                'periodo_academico_id' => app('tenant')->periodo_academico_activo_id,
                'fecha' => now(),
                'estado' => 'PRESENTE',
                'metodo_registro' => 'QR'
            ]);

            return $asistencia;

        } catch (\Exception $e) {
            Log::error("Error registrando asistencia por QR: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener reporte de asistencia de un estudiante
     */
    public function obtenerReporteEstudiante(int $estudianteId, Carbon $fechaInicio, Carbon $fechaFin): array
    {
        $asistencias = Asistencia::where('estudiante_id', $estudianteId)
                                  ->whereBetween('fecha', [$fechaInicio, $fechaFin])
                                  ->get();

        return [
            'total_dias' => $asistencias->count(),
            'presentes' => $asistencias->where('estado', 'PRESENTE')->count(),
            'ausentes' => $asistencias->where('estado', 'AUSENTE')->count(),
            'tardanzas' => $asistencias->where('estado', 'TARDANZA')->count(),
            'justificadas' => $asistencias->whereNotNull('justificacion')->count(),
            'porcentaje_asistencia' => $this->calcularPorcentaje($asistencias)
        ];
    }

    /**
     * Calcular porcentaje de asistencia
     */
    protected function calcularPorcentaje($asistencias): float
    {
        $total = $asistencias->count();
        if ($total == 0) return 0;

        $presentes = $asistencias->whereIn('estado', ['PRESENTE', 'TARDANZA'])->count();

        return round(($presentes / $total) * 100, 2);
    }
}
