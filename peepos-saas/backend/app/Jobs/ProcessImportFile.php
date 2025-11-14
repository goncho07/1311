<?php

namespace App\Jobs;

use App\Models\ImportFile;
use App\Models\ImportRecord;
use App\Services\Import\DocumentClassifier;
use App\Services\Import\DataExtractor;
use App\Services\Import\SchemaMapper;
use App\Services\Import\ValidationEngine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessImportFile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 600;
    public $backoff = 60;

    protected ImportFile $importFile;

    public function __construct(ImportFile $importFile)
    {
        $this->importFile = $importFile;
    }

    public function handle(
        DocumentClassifier $classifier,
        DataExtractor $extractor,
        SchemaMapper $mapper,
        ValidationEngine $validator
    ): void {
        $startTime = time();

        try {
            $this->importFile->update(['estado' => 'PROCESANDO']);

            Log::info("Procesando archivo de importación", [
                'file_id' => $this->importFile->id,
                'nombre' => $this->importFile->nombre_archivo,
            ]);

            $preview = $extractor->obtenerPreview(
                $this->importFile->ruta_archivo,
                $this->importFile->mime_type,
                5
            );

            $clasificacion = $classifier->clasificar(
                $this->importFile->nombre_archivo,
                $preview
            );

            $this->importFile->update([
                'modulo_detectado' => $clasificacion['modulo'],
                'confianza_clasificacion' => $clasificacion['confianza'],
            ]);

            if ($clasificacion['modulo'] === 'DESCONOCIDO') {
                throw new \Exception('No se pudo clasificar el documento');
            }

            $datosExtraidos = $extractor->extraer(
                $this->importFile->ruta_archivo,
                $this->importFile->mime_type
            );

            $totalRegistros = count($datosExtraidos['rows']);
            $registrosValidos = 0;
            $registrosInvalidos = 0;

            foreach ($datosExtraidos['rows'] as $index => $fila) {
                $datosMapeados = $mapper->mapear($clasificacion['modulo'], $fila);

                $validacion = $validator->validar($clasificacion['modulo'], $datosMapeados);

                ImportRecord::create([
                    'import_file_id' => $this->importFile->id,
                    'fila_numero' => $index + 1,
                    'datos_originales' => $fila,
                    'datos_mapeados' => $datosMapeados,
                    'estado_validacion' => $validacion['estado_validacion'],
                    'errores_validacion' => $validacion['errores_validacion'],
                    'advertencias' => $validacion['advertencias'],
                    'accion_sugerida' => $validacion['accion_sugerida'],
                ]);

                if ($validacion['estado_validacion'] === 'VALIDO' || $validacion['estado_validacion'] === 'DUPLICADO') {
                    $registrosValidos++;
                } else {
                    $registrosInvalidos++;
                }
            }

            $tiempoProcesamiento = time() - $startTime;

            $this->importFile->update([
                'estado' => 'PROCESADO',
                'total_registros' => $totalRegistros,
                'registros_validos' => $registrosValidos,
                'registros_invalidos' => $registrosInvalidos,
                'tiempo_procesamiento_segundos' => $tiempoProcesamiento,
                'fecha_procesamiento' => now(),
            ]);

            $this->importFile->batch->increment('archivos_procesados');

            if ($this->importFile->batch->archivos_procesados >= $this->importFile->batch->total_archivos) {
                $this->importFile->batch->update([
                    'estado' => 'COMPLETADO',
                    'fecha_fin' => now(),
                ]);
            }

            Log::info("Archivo procesado exitosamente", [
                'file_id' => $this->importFile->id,
                'total_registros' => $totalRegistros,
                'validos' => $registrosValidos,
                'invalidos' => $registrosInvalidos,
            ]);

        } catch (\Exception $e) {
            Log::error("Error procesando archivo de importación", [
                'file_id' => $this->importFile->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->importFile->update([
                'estado' => 'ERROR',
                'errores' => [
                    'mensaje' => $e->getMessage(),
                    'archivo' => $e->getFile(),
                    'linea' => $e->getLine(),
                ],
                'tiempo_procesamiento_segundos' => time() - $startTime,
                'fecha_procesamiento' => now(),
            ]);

            $this->importFile->batch->increment('archivos_procesados');

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Job ProcessImportFile falló después de {$this->tries} intentos", [
            'file_id' => $this->importFile->id,
            'error' => $exception->getMessage(),
        ]);

        $this->importFile->update([
            'estado' => 'ERROR',
            'errores' => [
                'mensaje' => 'Job falló después de ' . $this->tries . ' intentos',
                'ultimo_error' => $exception->getMessage(),
            ],
        ]);
    }
}
