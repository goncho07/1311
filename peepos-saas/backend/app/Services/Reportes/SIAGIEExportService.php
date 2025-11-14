<?php

namespace App\Services\Reportes;

use App\Models\Estudiante;
use App\Models\Evaluacion;
use App\Models\PeriodoAcademico;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SIAGIEExportService
{
    /**
     * Exportar datos para SIAGIE
     */
    public function exportarDatos(int $periodoId, string $tipo): string
    {
        try {
            $data = match($tipo) {
                'MATRICULAS' => $this->exportarMatriculas($periodoId),
                'NOTAS' => $this->exportarNotas($periodoId),
                'ASISTENCIAS' => $this->exportarAsistencias($periodoId),
                default => throw new \Exception("Tipo de exportación inválido: {$tipo}")
            };

            // Generar archivo CSV
            $filename = "siagie_{$tipo}_" . now()->timestamp . ".csv";
            $path = "exports/siagie/{$filename}";

            $this->generarCSV($path, $data);

            Log::info("Exportación SIAGIE generada", ['tipo' => $tipo, 'path' => $path]);

            return Storage::path($path);

        } catch (\Exception $e) {
            Log::error("Error exportando a SIAGIE: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Exportar matrículas
     */
    protected function exportarMatriculas(int $periodoId): array
    {
        return Estudiante::with('matriculas')
                        ->whereHas('matriculas', fn($q) => $q->where('periodo_academico_id', $periodoId))
                        ->get()
                        ->map(fn($e) => [
                            'codigo_estudiante' => $e->codigo_estudiante,
                            'dni' => $e->numero_documento,
                            'apellido_paterno' => $e->apellido_paterno,
                            'apellido_materno' => $e->apellido_materno,
                            'nombres' => $e->nombres,
                            'fecha_nacimiento' => $e->fecha_nacimiento->format('d/m/Y'),
                            'grado' => $e->matriculas->first()->grado,
                            'seccion' => $e->matriculas->first()->seccion
                        ])
                        ->toArray();
    }

    /**
     * Exportar notas
     */
    protected function exportarNotas(int $periodoId): array
    {
        return Evaluacion::with(['estudiante', 'areaCurricular'])
                         ->where('periodo_academico_id', $periodoId)
                         ->get()
                         ->map(fn($e) => [
                             'codigo_estudiante' => $e->estudiante->codigo_estudiante,
                             'area' => $e->areaCurricular->nombre,
                             'bimestre' => $e->bimestre,
                             'calificacion' => $e->calificacion_literal
                         ])
                         ->toArray();
    }

    /**
     * Exportar asistencias
     */
    protected function exportarAsistencias(int $periodoId): array
    {
        return [];  // Implementar según especificaciones MINEDU
    }

    /**
     * Generar archivo CSV
     */
    protected function generarCSV(string $path, array $data): void
    {
        $handle = fopen(Storage::path($path), 'w');

        // Escribir encabezados
        if (!empty($data)) {
            fputcsv($handle, array_keys($data[0]));

            // Escribir datos
            foreach ($data as $row) {
                fputcsv($handle, $row);
            }
        }

        fclose($handle);
    }
}
