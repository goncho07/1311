<?php

namespace App\Services\Matricula;

use App\Models\CupoDisponible;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CupoService
{
    /**
     * Verifica si hay cupos disponibles
     */
    public function verificarCupoDisponible(int $periodoId, string $grado, string $seccion): bool
    {
        $cupo = CupoDisponible::where('periodo_academico_id', $periodoId)
                              ->where('grado', $grado)
                              ->where('seccion', $seccion)
                              ->where('activo', true)
                              ->first();

        return $cupo && $cupo->cupos_disponibles > 0;
    }

    /**
     * Ocupa un cupo
     */
    public function ocuparCupo(int $periodoId, string $grado, string $seccion): void
    {
        $cupo = CupoDisponible::where('periodo_academico_id', $periodoId)
                              ->where('grado', $grado)
                              ->where('seccion', $seccion)
                              ->lockForUpdate()
                              ->firstOrFail();

        if ($cupo->cupos_disponibles <= 0) {
            throw new \Exception('No hay cupos disponibles');
        }

        $cupo->increment('cupos_ocupados');
        $cupo->decrement('cupos_disponibles');

        Log::info("Cupo ocupado", ['cupo_id' => $cupo->id]);
    }

    /**
     * Libera un cupo
     */
    public function liberarCupo(int $periodoId, string $grado, string $seccion): void
    {
        $cupo = CupoDisponible::where('periodo_academico_id', $periodoId)
                              ->where('grado', $grado)
                              ->where('seccion', $seccion)
                              ->lockForUpdate()
                              ->firstOrFail();

        $cupo->decrement('cupos_ocupados');
        $cupo->increment('cupos_disponibles');

        Log::info("Cupo liberado", ['cupo_id' => $cupo->id]);
    }

    /**
     * Crea cupos para un nuevo período académico
     */
    public function crearCuposParaPeriodo(int $periodoId, array $configuracion): void
    {
        DB::beginTransaction();

        try {
            foreach ($configuracion as $config) {
                CupoDisponible::create([
                    'uuid' => \Str::uuid(),
                    'periodo_academico_id' => $periodoId,
                    'grado' => $config['grado'],
                    'seccion' => $config['seccion'],
                    'nivel_educativo' => $config['nivel_educativo'],
                    'cupos_totales' => $config['cupos_totales'],
                    'cupos_disponibles' => $config['cupos_totales'],
                    'cupos_ocupados' => 0,
                    'cupos_reservados' => 0,
                    'activo' => true
                ]);
            }

            DB::commit();

            Log::info("Cupos creados para período", ['periodo_id' => $periodoId]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creando cupos: " . $e->getMessage());
            throw $e;
        }
    }
}
