<?php

namespace App\Services\Reportes;

use App\Models\ReporteGenerado;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use PDF;

class PDFGeneratorService
{
    /**
     * Generar reporte en PDF
     */
    public function generarReporte(string $tipoReporte, array $parametros, string $vista): string
    {
        try {
            // Generar PDF
            $pdf = PDF::loadView($vista, $parametros);

            $filename = "{$tipoReporte}_" . now()->timestamp . ".pdf";
            $path = "reportes/{$filename}";

            Storage::put($path, $pdf->output());

            // Registrar en BD
            ReporteGenerado::create([
                'uuid' => \Str::uuid(),
                'tipo_reporte' => $tipoReporte,
                'nombre' => $parametros['nombre'] ?? $tipoReporte,
                'formato' => 'PDF',
                'parametros' => $parametros,
                'fecha_generacion' => now(),
                'generado_por' => auth()->id(),
                'url_archivo' => $path,
                'tamano_bytes' => Storage::size($path),
                'estado' => 'COMPLETADO'
            ]);

            Log::info("Reporte PDF generado", ['tipo' => $tipoReporte, 'path' => $path]);

            return Storage::path($path);

        } catch (\Exception $e) {
            Log::error("Error generando reporte PDF: " . $e->getMessage());
            throw $e;
        }
    }
}
