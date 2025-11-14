<?php

namespace App\Services\Import;

use App\Models\ImportBatch;
use App\Models\ImportFile;
use App\Models\Tenant;
use App\Jobs\ProcessImportFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportBatchService
{
    public function crearBatchDesdeUpload(
        $tenant,
        int $usuarioId,
        array $uploadedFiles,
        array $configuracion = []
    ) {
        $batch = ImportBatch::create([
            'uuid' => Str::uuid(),
            'tenant_id' => $tenant->id,
            'usuario_id' => $usuarioId,
            'nombre_batch' => $configuracion['nombre'] ?? 'Importación ' . now()->format('Y-m-d H:i'),
            'tipo_origen' => 'UPLOAD_DIRECTO',
            'estado' => 'PENDIENTE',
            'total_archivos' => count($uploadedFiles),
            'archivos_procesados' => 0,
            'configuracion' => $configuracion,
            'fecha_inicio' => now(),
        ]);

        foreach ($uploadedFiles as $uploadedFile) {
            $this->procesarArchivoUpload($batch, $uploadedFile);
        }

        $batch->update(['estado' => 'EN_PROGRESO']);
        $this->despacharJobsProcesamiento($batch);

        return $batch->fresh();
    }

    protected function procesarArchivoUpload($batch, $uploadedFile): void
    {
        try {
            $filename = Str::slug(pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME)) .
                        '_' . time() . '.' .
                        $uploadedFile->getClientOriginalExtension();

            $path = "imports/{$batch->tenant_id}/{$batch->uuid}/{$filename}";

            Storage::putFileAs(
                "imports/{$batch->tenant_id}/{$batch->uuid}",
                $uploadedFile,
                $filename
            );

            ImportFile::create([
                'import_batch_id' => $batch->id,
                'nombre_archivo' => $uploadedFile->getClientOriginalName(),
                'ruta_archivo' => $path,
                'mime_type' => $uploadedFile->getMimeType(),
                'tamaño_kb' => (int) ($uploadedFile->getSize() / 1024),
                'estado' => 'PENDIENTE',
            ]);

        } catch (\Exception $e) {
            \Log::error("Error guardando archivo: {$uploadedFile->getClientOriginalName()}", [
                'error' => $e->getMessage(),
                'batch_id' => $batch->id,
            ]);
        }
    }

    protected function despacharJobsProcesamiento($batch): void
    {
        $files = $batch->files()->where('estado', 'PENDIENTE')->get();

        foreach ($files as $file) {
            ProcessImportFile::dispatch($file)
                ->onQueue('imports')
                ->delay(now()->addSeconds(5));
        }
    }

    public function obtenerEstadoBatch($batch): array
    {
        return [
            'id' => $batch->id,
            'uuid' => $batch->uuid,
            'nombre_batch' => $batch->nombre_batch,
            'estado' => $batch->estado,
            'total_archivos' => $batch->total_archivos,
            'archivos_procesados' => $batch->archivos_procesados,
            'progreso_porcentaje' => $batch->progreso_porcentaje,
            'archivos_por_estado' => [
                'pendiente' => $batch->files()->where('estado', 'PENDIENTE')->count(),
                'procesando' => $batch->files()->where('estado', 'PROCESANDO')->count(),
                'procesado' => $batch->files()->where('estado', 'PROCESADO')->count(),
                'error' => $batch->files()->where('estado', 'ERROR')->count(),
            ],
            'registros_totales' => $batch->files()->sum('total_registros'),
            'registros_validos' => $batch->files()->sum('registros_validos'),
            'registros_invalidos' => $batch->files()->sum('registros_invalidos'),
        ];
    }

    public function cancelarBatch($batch): void
    {
        $batch->update([
            'estado' => 'CANCELADO',
            'fecha_fin' => now(),
        ]);

        $batch->files()
            ->whereIn('estado', ['PENDIENTE', 'PROCESANDO'])
            ->update(['estado' => 'CANCELADO']);
    }
}
