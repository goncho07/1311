<?php

namespace App\Services\Academic;

use App\Models\Estudiante;
use App\Models\Evaluacion;
use App\Models\PeriodoAcademico;
use App\Models\HistorialAcademico;
use Illuminate\Support\Facades\Log;
use PDF;

class BoletaService
{
    /**
     * Genera boleta de notas en PDF
     */
    public function generarBoleta(
        int $estudianteId,
        int $periodoId,
        string $bimestre
    ): string {
        try {
            // Obtener datos del estudiante
            $estudiante = Estudiante::with(['apoderados', 'matriculas' => function($q) use ($periodoId) {
                $q->where('periodo_academico_id', $periodoId);
            }])->findOrFail($estudianteId);

            // Obtener evaluaciones del bimestre
            $evaluaciones = Evaluacion::with(['areaCurricular', 'competencia', 'docente'])
                                       ->where('estudiante_id', $estudianteId)
                                       ->where('periodo_academico_id', $periodoId)
                                       ->where('bimestre', $bimestre)
                                       ->where('activo', true)
                                       ->orderBy('area_curricular_id')
                                       ->get();

            // Agrupar evaluaciones por área
            $evaluacionesPorArea = $evaluaciones->groupBy('area_curricular_id');

            // Obtener período académico
            $periodo = PeriodoAcademico::findOrFail($periodoId);

            // Obtener historial para promedio
            $historial = HistorialAcademico::where('estudiante_id', $estudianteId)
                                           ->where('periodo_academico_id', $periodoId)
                                           ->first();

            // Datos para la boleta
            $data = [
                'estudiante' => $estudiante,
                'periodo' => $periodo,
                'bimestre' => $bimestre,
                'evaluaciones_por_area' => $evaluacionesPorArea,
                'historial' => $historial,
                'fecha_generacion' => now(),
            ];

            // Generar PDF
            $pdf = PDF::loadView('pdfs.boleta', $data);

            $filename = "boleta_{$estudianteId}_{$periodoId}_{$bimestre}.pdf";
            $path = storage_path("app/boletas/{$filename}");

            // Crear directorio si no existe
            if (!is_dir(dirname($path))) {
                mkdir(dirname($path), 0755, true);
            }

            $pdf->save($path);

            Log::info("Boleta generada", [
                'estudiante_id' => $estudianteId,
                'periodo_id' => $periodoId,
                'bimestre' => $bimestre,
                'path' => $path
            ]);

            return $path;

        } catch (\Exception $e) {
            Log::error("Error generando boleta: " . $e->getMessage(), [
                'estudiante_id' => $estudianteId,
                'periodo_id' => $periodoId,
                'bimestre' => $bimestre
            ]);
            throw $e;
        }
    }

    /**
     * Genera boleta de estudiante para descarga directa (sin guardar)
     */
    public function generarBoletaEstudiante(
        int $estudianteId,
        int $periodoId,
        string $bimestre
    ) {
        try {
            // Obtener datos del estudiante
            $estudiante = Estudiante::with(['apoderados', 'matriculas' => function($q) use ($periodoId) {
                $q->where('periodo_academico_id', $periodoId);
            }])->findOrFail($estudianteId);

            // Obtener evaluaciones del bimestre
            $evaluaciones = Evaluacion::with(['areaCurricular', 'competencia', 'docente'])
                                       ->where('estudiante_id', $estudianteId)
                                       ->where('periodo_academico_id', $periodoId)
                                       ->where('bimestre', $bimestre)
                                       ->where('activo', true)
                                       ->orderBy('area_curricular_id')
                                       ->get();

            // Agrupar evaluaciones por área
            $evaluacionesPorArea = $evaluaciones->groupBy('area_curricular_id');

            // Obtener período académico
            $periodo = PeriodoAcademico::findOrFail($periodoId);

            // Obtener historial para promedio
            $historial = HistorialAcademico::where('estudiante_id', $estudianteId)
                                           ->where('periodo_academico_id', $periodoId)
                                           ->first();

            // Datos para la boleta
            $data = [
                'estudiante' => $estudiante,
                'periodo' => $periodo,
                'bimestre' => $bimestre,
                'evaluaciones_por_area' => $evaluacionesPorArea,
                'historial' => $historial,
                'fecha_generacion' => now(),
            ];

            // Generar PDF y retornar para descarga directa
            $pdf = PDF::loadView('pdfs.boleta', $data);

            Log::info("Boleta generada para descarga", [
                'estudiante_id' => $estudianteId,
                'periodo_id' => $periodoId,
                'bimestre' => $bimestre,
            ]);

            return $pdf;

        } catch (\Exception $e) {
            Log::error("Error generando boleta para estudiante: " . $e->getMessage(), [
                'estudiante_id' => $estudianteId,
                'periodo_id' => $periodoId,
                'bimestre' => $bimestre
            ]);
            throw $e;
        }
    }

    /**
     * Genera boletas masivas para un grado y sección
     */
    public function generarBoletasMasivas(
        string $grado,
        string $seccion,
        int $periodoId,
        string $bimestre
    ): array {
        $resultados = [
            'exitosas' => [],
            'fallidas' => []
        ];

        try {
            // Obtener estudiantes del grado y sección
            $estudiantes = Estudiante::whereHas('matriculas', function($q) use ($grado, $seccion, $periodoId) {
                $q->where('grado', $grado)
                  ->where('seccion', $seccion)
                  ->where('periodo_academico_id', $periodoId)
                  ->where('situacion', 'ACTIVA');
            })->get();

            foreach ($estudiantes as $estudiante) {
                try {
                    $path = $this->generarBoleta($estudiante->id, $periodoId, $bimestre);
                    $resultados['exitosas'][] = [
                        'estudiante_id' => $estudiante->id,
                        'estudiante_nombre' => $estudiante->nombre_completo,
                        'path' => $path
                    ];
                } catch (\Exception $e) {
                    $resultados['fallidas'][] = [
                        'estudiante_id' => $estudiante->id,
                        'estudiante_nombre' => $estudiante->nombre_completo,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return $resultados;

        } catch (\Exception $e) {
            Log::error("Error generando boletas masivas: " . $e->getMessage());
            throw $e;
        }
    }
}
