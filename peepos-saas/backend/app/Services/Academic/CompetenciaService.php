<?php

namespace App\Services\Academic;

use App\Models\CompetenciaMinedu;
use App\Models\CapacidadCompetencia;
use App\Models\AreaCurricular;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompetenciaService
{
    /**
     * Crear competencia con sus capacidades
     */
    public function crearCompetencia(array $data): CompetenciaMinedu
    {
        DB::beginTransaction();

        try {
            $competencia = CompetenciaMinedu::create([
                'uuid' => \Str::uuid(),
                'area_curricular_id' => $data['area_curricular_id'],
                'codigo' => $data['codigo'],
                'nombre' => $data['nombre'],
                'descripcion' => $data['descripcion'] ?? null,
                'nivel_educativo' => $data['nivel_educativo'],
                'grado' => $data['grado'] ?? null,
                'activo' => true
            ]);

            // Crear capacidades si se proporcionan
            if (isset($data['capacidades']) && is_array($data['capacidades'])) {
                foreach ($data['capacidades'] as $index => $capacidadData) {
                    CapacidadCompetencia::create([
                        'uuid' => \Str::uuid(),
                        'competencia_minedu_id' => $competencia->id,
                        'codigo' => $capacidadData['codigo'] ?? "CAP-{$index}",
                        'nombre' => $capacidadData['nombre'],
                        'descripcion' => $capacidadData['descripcion'] ?? null,
                        'orden' => $capacidadData['orden'] ?? $index + 1,
                        'activo' => true
                    ]);
                }
            }

            DB::commit();

            Log::info("Competencia creada", ['competencia_id' => $competencia->id]);

            return $competencia->load('capacidades');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creando competencia: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener competencias por área y grado
     */
    public function obtenerCompetenciasPorAreaYGrado(
        int $areaCurricularId,
        string $grado
    ): \Illuminate\Database\Eloquent\Collection {
        return CompetenciaMinedu::with('capacidades')
                                ->where('area_curricular_id', $areaCurricularId)
                                ->where('grado', $grado)
                                ->where('activo', true)
                                ->orderBy('codigo')
                                ->get();
    }

    /**
     * Importar competencias desde archivo MINEDU
     */
    public function importarDesdeArchivoMinedu(string $filePath, string $nivelEducativo): array
    {
        $competenciasCreadas = [];
        $errores = [];

        try {
            $data = json_decode(file_get_contents($filePath), true);

            foreach ($data['competencias'] as $competenciaData) {
                try {
                    $competencia = $this->crearCompetencia($competenciaData);
                    $competenciasCreadas[] = $competencia;
                } catch (\Exception $e) {
                    $errores[] = [
                        'competencia' => $competenciaData['nombre'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            return [
                'creadas' => count($competenciasCreadas),
                'errores' => $errores
            ];

        } catch (\Exception $e) {
            Log::error("Error importando competencias: " . $e->getMessage());
            throw $e;
        }
    }
}
