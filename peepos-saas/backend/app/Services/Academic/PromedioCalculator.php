<?php

namespace App\Services\Academic;

use App\Models\Evaluacion;
use App\Models\HistorialAcademico;
use App\Models\AreaCurricular;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PromedioCalculator
{
    /**
     * Calcula y actualiza historial académico del estudiante
     */
    public function actualizarHistorialAcademico(
        int $estudianteId,
        int $periodoId,
        string $bimestre
    ): void {
        try {
            // Obtener todas las evaluaciones del bimestre
            $evaluaciones = Evaluacion::where('estudiante_id', $estudianteId)
                                       ->where('periodo_academico_id', $periodoId)
                                       ->where('bimestre', $bimestre)
                                       ->where('activo', true)
                                       ->get();

            if ($evaluaciones->isEmpty()) {
                return;
            }

            // Calcular promedio ponderado del bimestre
            $promedioBimestre = $this->calcularPromedioPonderado($evaluaciones);

            // Obtener o crear historial académico
            $historial = HistorialAcademico::firstOrCreate(
                [
                    'estudiante_id' => $estudianteId,
                    'periodo_academico_id' => $periodoId
                ],
                [
                    'grado' => $evaluaciones->first()->estudiante->matriculas()
                              ->where('periodo_academico_id', $periodoId)
                              ->first()->grado ?? null,
                    'nivel_educativo' => $evaluaciones->first()->estudiante->matriculas()
                                        ->where('periodo_academico_id', $periodoId)
                                        ->first()->nivel_educativo ?? null,
                ]
            );

            // Actualizar promedio del bimestre correspondiente
            $this->actualizarPromedioBimestre($historial, $bimestre, $promedioBimestre);

            // Si es el último bimestre, calcular promedio anual
            if ($bimestre === 'IV') {
                $this->calcularPromedioAnual($historial);
            }

            Log::info("Historial académico actualizado", [
                'estudiante_id' => $estudianteId,
                'bimestre' => $bimestre,
                'promedio' => $promedioBimestre
            ]);

        } catch (\Exception $e) {
            Log::error("Error actualizando historial académico: " . $e->getMessage(), [
                'estudiante_id' => $estudianteId,
                'periodo_id' => $periodoId,
                'bimestre' => $bimestre
            ]);
            throw $e;
        }
    }

    /**
     * Calcula promedio ponderado de evaluaciones
     */
    protected function calcularPromedioPonderado($evaluaciones): float
    {
        $sumaPonderada = 0;
        $sumaPesos = 0;

        foreach ($evaluaciones as $evaluacion) {
            $peso = $evaluacion->peso ?? 1.0;
            $sumaPonderada += $evaluacion->calificacion_numerica * $peso;
            $sumaPesos += $peso;
        }

        return $sumaPesos > 0 ? round($sumaPonderada / $sumaPesos, 2) : 0;
    }

    /**
     * Actualiza el promedio del bimestre específico
     */
    protected function actualizarPromedioBimestre(
        HistorialAcademico $historial,
        string $bimestre,
        float $promedio
    ): void {
        $campos = $this->getCamposMetadata($bimestre);

        $historial->update([
            $campos['promedio'] => $promedio
        ]);

        // Actualizar metadata con detalles por área
        $metadata = $historial->metadata ?? [];
        $metadata[$bimestre] = $this->obtenerDetallesPorArea(
            $historial->estudiante_id,
            $historial->periodo_academico_id,
            $bimestre
        );

        $historial->update(['metadata' => $metadata]);
    }

    /**
     * Obtiene los nombres de campos según el bimestre
     */
    protected function getCamposMetadata(string $bimestre): array
    {
        return match($bimestre) {
            'I' => [
                'promedio' => 'promedio_bimestre_1',
                'observaciones' => 'observaciones_bimestre_1'
            ],
            'II' => [
                'promedio' => 'promedio_bimestre_2',
                'observaciones' => 'observaciones_bimestre_2'
            ],
            'III' => [
                'promedio' => 'promedio_bimestre_3',
                'observaciones' => 'observaciones_bimestre_3'
            ],
            'IV' => [
                'promedio' => 'promedio_bimestre_4',
                'observaciones' => 'observaciones_bimestre_4'
            ],
        };
    }

    /**
     * Obtiene detalles de evaluación por área curricular
     */
    protected function obtenerDetallesPorArea(
        int $estudianteId,
        int $periodoId,
        string $bimestre
    ): array {
        $evaluaciones = Evaluacion::with('areaCurricular')
                                   ->where('estudiante_id', $estudianteId)
                                   ->where('periodo_academico_id', $periodoId)
                                   ->where('bimestre', $bimestre)
                                   ->where('activo', true)
                                   ->get();

        return $evaluaciones->groupBy('area_curricular_id')
                           ->map(function ($grupo) {
                               $promedio = $this->calcularPromedioPonderado($grupo);
                               $area = $grupo->first()->areaCurricular;

                               return [
                                   'area_nombre' => $area->nombre,
                                   'promedio' => $promedio,
                                   'calificacion_literal' => $this->convertirALiteral($promedio),
                                   'cantidad_evaluaciones' => $grupo->count()
                               ];
                           })
                           ->values()
                           ->toArray();
    }

    /**
     * Calcula promedio anual y determina situación final
     */
    protected function calcularPromedioAnual(HistorialAcademico $historial): void
    {
        $promedios = [
            $historial->promedio_bimestre_1,
            $historial->promedio_bimestre_2,
            $historial->promedio_bimestre_3,
            $historial->promedio_bimestre_4
        ];

        $promedios = array_filter($promedios, fn($p) => $p !== null);

        if (count($promedios) > 0) {
            $promedioGeneral = round(array_sum($promedios) / count($promedios), 2);

            // Calcular promedio ponderado si hay pesos configurados
            $promedioPonderado = $this->calcularPromedioPonderadoAnual($historial);

            // Determinar áreas desaprobadas
            $areasDesaprobadas = $this->obtenerAreasDesaprobadas($historial);

            // Determinar situación final
            $situacionFinal = $this->determinarSituacionFinal(
                $promedioGeneral,
                $areasDesaprobadas
            );

            $historial->update([
                'promedio_general' => $promedioGeneral,
                'promedio_ponderado' => $promedioPonderado,
                'areas_desaprobadas' => $areasDesaprobadas,
                'situacion_final' => $situacionFinal,
                'observaciones' => $this->generarObservacionesFinal($situacionFinal, $areasDesaprobadas)
            ]);

            Log::info("Promedio anual calculado", [
                'estudiante_id' => $historial->estudiante_id,
                'promedio_general' => $promedioGeneral,
                'situacion_final' => $situacionFinal
            ]);
        }
    }

    /**
     * Calcula promedio ponderado anual
     */
    protected function calcularPromedioPonderadoAnual(HistorialAcademico $historial): float
    {
        // Por defecto, cada bimestre tiene el mismo peso
        $peso = 0.25;

        $suma = ($historial->promedio_bimestre_1 ?? 0) * $peso
              + ($historial->promedio_bimestre_2 ?? 0) * $peso
              + ($historial->promedio_bimestre_3 ?? 0) * $peso
              + ($historial->promedio_bimestre_4 ?? 0) * $peso;

        return round($suma, 2);
    }

    /**
     * Obtiene áreas desaprobadas (promedio < 11)
     */
    protected function obtenerAreasDesaprobadas(HistorialAcademico $historial): array
    {
        $areasDesaprobadas = [];

        // Revisar metadata de todos los bimestres
        $metadata = $historial->metadata ?? [];

        $todasLasAreas = [];

        foreach (['I', 'II', 'III', 'IV'] as $bimestre) {
            if (isset($metadata[$bimestre])) {
                foreach ($metadata[$bimestre] as $area) {
                    $areaId = $area['area_nombre'];
                    if (!isset($todasLasAreas[$areaId])) {
                        $todasLasAreas[$areaId] = [];
                    }
                    $todasLasAreas[$areaId][] = $area['promedio'];
                }
            }
        }

        // Calcular promedio por área
        foreach ($todasLasAreas as $areaNombre => $promedios) {
            $promedioArea = array_sum($promedios) / count($promedios);
            if ($promedioArea < 11) {
                $areasDesaprobadas[] = [
                    'area' => $areaNombre,
                    'promedio' => round($promedioArea, 2)
                ];
            }
        }

        return $areasDesaprobadas;
    }

    /**
     * Determina la situación final del estudiante
     */
    protected function determinarSituacionFinal(
        float $promedioGeneral,
        array $areasDesaprobadas
    ): string {
        $cantidadDesaprobadas = count($areasDesaprobadas);

        // APROBADO: Promedio >= 11 y máximo 2 áreas desaprobadas
        if ($promedioGeneral >= 11 && $cantidadDesaprobadas <= 2) {
            return 'APROBADO';
        }

        // RECUPERACION: 3 áreas desaprobadas o promedio entre 9-11
        if ($cantidadDesaprobadas <= 3 || ($promedioGeneral >= 9 && $promedioGeneral < 11)) {
            return 'RECUPERACION';
        }

        // DESAPROBADO: Más de 3 áreas desaprobadas o promedio < 9
        return 'DESAPROBADO';
    }

    /**
     * Genera observaciones finales automáticas
     */
    protected function generarObservacionesFinal(
        string $situacionFinal,
        array $areasDesaprobadas
    ): string {
        if ($situacionFinal === 'APROBADO') {
            return 'El estudiante ha cumplido satisfactoriamente con los objetivos de aprendizaje.';
        }

        if ($situacionFinal === 'RECUPERACION') {
            $areas = implode(', ', array_column($areasDesaprobadas, 'area'));
            return "El estudiante requiere recuperación en las siguientes áreas: {$areas}.";
        }

        return 'El estudiante no ha alcanzado los objetivos de aprendizaje requeridos.';
    }

    /**
     * Convierte calificación numérica a literal
     */
    protected function convertirALiteral(float $numerica): string
    {
        if ($numerica >= 18) return 'AD';
        if ($numerica >= 14) return 'A';
        if ($numerica >= 11) return 'B';
        return 'C';
    }
}
