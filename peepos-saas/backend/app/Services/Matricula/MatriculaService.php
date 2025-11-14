<?php

namespace App\Services\Matricula;

use App\Models\Matricula;
use App\Models\Estudiante;
use App\Models\CupoDisponible;
use App\Models\PeriodoAcademico;
use App\Events\MatriculaCreada;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MatriculaService
{
    public function __construct(
        protected CupoService $cupoService
    ) {}

    /**
     * Procesa solicitud de matrícula
     */
    public function procesarMatricula(array $data): Matricula
    {
        DB::beginTransaction();

        try {
            // Validar cupos disponibles
            if (!$this->cupoService->verificarCupoDisponible(
                $data['periodo_academico_id'],
                $data['grado'],
                $data['seccion']
            )) {
                throw new \Exception('No hay cupos disponibles para esta sección');
            }

            // Verificar que estudiante no esté ya matriculado en este período
            $matriculaExistente = Matricula::where('estudiante_id', $data['estudiante_id'])
                                           ->where('periodo_academico_id', $data['periodo_academico_id'])
                                           ->whereIn('situacion', ['ACTIVA', 'CONFIRMADA'])
                                           ->exists();

            if ($matriculaExistente) {
                throw new \Exception('El estudiante ya está matriculado en este período');
            }

            // Crear matrícula
            $matricula = Matricula::create([
                'uuid' => \Str::uuid(),
                'codigo_matricula' => $this->generarCodigoMatricula($data),
                'estudiante_id' => $data['estudiante_id'],
                'periodo_academico_id' => $data['periodo_academico_id'],
                'grado' => $data['grado'],
                'seccion' => $data['seccion'],
                'nivel_educativo' => $data['nivel_educativo'],
                'turno' => $data['turno'] ?? 'MAÑANA',
                'tipo_matricula' => $data['tipo_matricula'] ?? 'RATIFICACION',
                'fecha_matricula' => now(),
                'situacion' => 'SOLICITADA',
                'documentos_completos' => false,
                'requiere_traslado' => $data['requiere_traslado'] ?? false,
                'institucion_procedencia' => $data['institucion_procedencia'] ?? null,
            ]);

            // Reservar cupo
            $this->cupoService->ocuparCupo(
                $data['periodo_academico_id'],
                $data['grado'],
                $data['seccion']
            );

            DB::commit();

            // Notificar a apoderados
            event(new MatriculaCreada($matricula));

            Log::info("Matrícula procesada", ['matricula_id' => $matricula->id]);

            return $matricula->fresh();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error procesando matrícula: " . $e->getMessage(), ['data' => $data]);
            throw $e;
        }
    }

    /**
     * Genera código único de matrícula
     */
    protected function generarCodigoMatricula(array $data): string
    {
        $periodo = PeriodoAcademico::find($data['periodo_academico_id']);
        $sequence = Matricula::where('periodo_academico_id', $data['periodo_academico_id'])->count() + 1;

        return sprintf(
            'MAT%s%s%s%04d',
            $periodo->anio,
            $data['grado'],
            $data['seccion'],
            $sequence
        );
    }

    /**
     * Aprobar matrícula
     */
    public function aprobarMatricula(int $matriculaId): Matricula
    {
        $matricula = Matricula::findOrFail($matriculaId);

        if ($matricula->situacion !== 'SOLICITADA') {
            throw new \Exception('Solo se pueden aprobar matrículas en estado SOLICITADA');
        }

        $matricula->update([
            'situacion' => 'ACTIVA',
        ]);

        // Actualizar estado del estudiante
        $matricula->estudiante->update(['estado' => 'MATRICULADO']);

        Log::info("Matrícula aprobada", ['matricula_id' => $matriculaId]);

        return $matricula->fresh();
    }

    /**
     * Anular matrícula
     */
    public function anularMatricula(int $matriculaId, string $motivo): bool
    {
        DB::beginTransaction();

        try {
            $matricula = Matricula::findOrFail($matriculaId);

            $matricula->update([
                'situacion' => 'ANULADA',
                'observaciones' => $motivo
            ]);

            // Liberar cupo
            $this->cupoService->liberarCupo(
                $matricula->periodo_academico_id,
                $matricula->grado,
                $matricula->seccion
            );

            DB::commit();

            Log::info("Matrícula anulada", ['matricula_id' => $matriculaId, 'motivo' => $motivo]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error anulando matrícula: " . $e->getMessage());
            return false;
        }
    }
}
