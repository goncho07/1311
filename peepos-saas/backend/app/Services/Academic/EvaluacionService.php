<?php

namespace App\Services\Academic;

use App\Models\Evaluacion;
use App\Models\HistorialAcademico;
use App\Models\Estudiante;
use App\Events\EstudianteEnRiesgo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluacionService
{
    public function __construct(
        protected PromedioCalculator $promedioCalculator
    ) {}

    /**
     * Registra evaluación de competencia
     */
    public function registrarEvaluacion(array $data): Evaluacion
    {
        DB::beginTransaction();

        try {
            // Convertir calificación literal a numérica
            $calificacionNumerica = $this->convertirCalificacion($data['calificacion_literal']);

            $evaluacion = Evaluacion::updateOrCreate(
                [
                    'estudiante_id' => $data['estudiante_id'],
                    'competencia_minedu_id' => $data['competencia_minedu_id'],
                    'periodo_academico_id' => $data['periodo_academico_id'],
                    'bimestre' => $data['bimestre']
                ],
                [
                    'docente_id' => $data['docente_id'] ?? auth()->id(),
                    'area_curricular_id' => $data['area_curricular_id'],
                    'asignacion_docente_id' => $data['asignacion_docente_id'] ?? null,
                    'tipo_evaluacion' => $data['tipo_evaluacion'] ?? 'FORMATIVA',
                    'nivel_logro' => $data['nivel_logro'] ?? null,
                    'calificacion_literal' => $data['calificacion_literal'],
                    'calificacion_numerica' => $calificacionNumerica,
                    'peso' => $data['peso'] ?? 1.0,
                    'descripcion_logro' => $data['descripcion_logro'] ?? null,
                    'recomendaciones' => $data['recomendaciones'] ?? null,
                    'fecha_evaluacion' => $data['fecha_evaluacion'] ?? now(),
                    'activo' => true
                ]
            );

            // Actualizar historial académico
            $this->promedioCalculator->actualizarHistorialAcademico(
                $data['estudiante_id'],
                $data['periodo_academico_id'],
                $data['bimestre']
            );

            DB::commit();

            // Notificar si hay cambio significativo (en riesgo)
            if ($data['calificacion_literal'] === 'C') {
                event(new EstudianteEnRiesgo($evaluacion));
            }

            Log::info("Evaluación registrada", [
                'evaluacion_id' => $evaluacion->id,
                'estudiante_id' => $data['estudiante_id'],
                'calificacion' => $data['calificacion_literal']
            ]);

            return $evaluacion->fresh();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error registrando evaluación: " . $e->getMessage(), [
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Registrar múltiples evaluaciones en lote
     */
    public function registrarEvaluacionesLote(array $evaluaciones): array
    {
        $resultados = [
            'exitosas' => [],
            'fallidas' => []
        ];

        foreach ($evaluaciones as $evaluacionData) {
            try {
                $evaluacion = $this->registrarEvaluacion($evaluacionData);
                $resultados['exitosas'][] = $evaluacion;
            } catch (\Exception $e) {
                $resultados['fallidas'][] = [
                    'data' => $evaluacionData,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $resultados;
    }

    /**
     * Convierte calificación literal a numérica según MINEDU
     */
    public function convertirCalificacion(string $literal): float
    {
        return match($literal) {
            'AD' => 19.0,  // Logro destacado
            'A'  => 15.5,  // Logro esperado
            'B'  => 12.0,  // En proceso
            'C'  => 9.0,   // En inicio
            default => 0.0
        };
    }

    /**
     * Convierte calificación numérica a literal
     */
    public function convertirALiteral(float $numerica): string
    {
        if ($numerica >= 18) return 'AD';
        if ($numerica >= 14) return 'A';
        if ($numerica >= 11) return 'B';
        return 'C';
    }

    /**
     * Obtener evaluaciones de un estudiante
     */
    public function obtenerEvaluacionesEstudiante(
        int $estudianteId,
        int $periodoAcademicoId,
        ?string $bimestre = null
    ): \Illuminate\Database\Eloquent\Collection {
        $query = Evaluacion::with(['areaCurricular', 'competencia', 'docente'])
                           ->where('estudiante_id', $estudianteId)
                           ->where('periodo_academico_id', $periodoAcademicoId);

        if ($bimestre) {
            $query->where('bimestre', $bimestre);
        }

        return $query->get();
    }

    /**
     * Obtener estadísticas de evaluaciones de un estudiante
     */
    public function obtenerEstadisticasEstudiante(
        int $estudianteId,
        int $periodoAcademicoId
    ): array {
        $evaluaciones = $this->obtenerEvaluacionesEstudiante(
            $estudianteId,
            $periodoAcademicoId
        );

        return [
            'total_evaluaciones' => $evaluaciones->count(),
            'promedio_general' => $evaluaciones->avg('calificacion_numerica'),
            'logros_destacados' => $evaluaciones->where('calificacion_literal', 'AD')->count(),
            'logros_esperados' => $evaluaciones->where('calificacion_literal', 'A')->count(),
            'en_proceso' => $evaluaciones->where('calificacion_literal', 'B')->count(),
            'en_inicio' => $evaluaciones->where('calificacion_literal', 'C')->count(),
            'areas_con_dificultad' => $this->obtenerAreasConDificultad($evaluaciones),
        ];
    }

    /**
     * Obtener áreas donde el estudiante tiene dificultades
     */
    protected function obtenerAreasConDificultad($evaluaciones): array
    {
        return $evaluaciones->where('calificacion_literal', 'C')
                           ->groupBy('area_curricular_id')
                           ->map(function ($grupo) {
                               $area = $grupo->first()->areaCurricular;
                               return [
                                   'area' => $area->nombre,
                                   'cantidad_evaluaciones_c' => $grupo->count()
                               ];
                           })
                           ->values()
                           ->toArray();
    }

    /**
     * Validar que se puede registrar una evaluación
     */
    public function validarEvaluacion(array $data): array
    {
        $errores = [];

        // Validar que el estudiante existe y está activo
        $estudiante = Estudiante::find($data['estudiante_id']);
        if (!$estudiante || $estudiante->estado !== 'ACTIVO') {
            $errores[] = 'El estudiante no existe o no está activo';
        }

        // Validar calificación literal válida
        if (!in_array($data['calificacion_literal'], ['AD', 'A', 'B', 'C'])) {
            $errores[] = 'Calificación literal inválida';
        }

        // Validar bimestre válido
        if (!in_array($data['bimestre'], ['I', 'II', 'III', 'IV'])) {
            $errores[] = 'Bimestre inválido';
        }

        return $errores;
    }

    /**
     * Eliminar evaluación
     */
    public function eliminarEvaluacion(int $evaluacionId): bool
    {
        try {
            $evaluacion = Evaluacion::findOrFail($evaluacionId);

            DB::beginTransaction();

            $estudiante_id = $evaluacion->estudiante_id;
            $periodo_id = $evaluacion->periodo_academico_id;
            $bimestre = $evaluacion->bimestre;

            $evaluacion->delete();

            // Recalcular promedios
            $this->promedioCalculator->actualizarHistorialAcademico(
                $estudiante_id,
                $periodo_id,
                $bimestre
            );

            DB::commit();

            Log::info("Evaluación eliminada", ['evaluacion_id' => $evaluacionId]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error eliminando evaluación: " . $e->getMessage());
            return false;
        }
    }
}
