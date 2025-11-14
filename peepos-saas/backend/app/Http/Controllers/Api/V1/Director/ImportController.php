<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Models\ImportBatch;
use App\Models\ImportFile;
use App\Models\ImportRecord;
use App\Services\Import\ImportBatchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ImportController extends Controller
{
    protected ImportBatchService $batchService;

    public function __construct(ImportBatchService $batchService)
    {
        $this->batchService = $batchService;
    }

    public function crearBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'archivos' => 'required|array|min:1',
            'archivos.*' => 'required|file|mimes:xlsx,xls,pdf,docx,csv|max:10240',
        ]);

        $tenant = $request->user()->tenant;
        $usuarioId = $request->user()->id;

        $batch = $this->batchService->crearBatchDesdeUpload(
            $tenant,
            $usuarioId,
            $request->file('archivos'),
            ['nombre' => $validated['nombre'] ?? null]
        );

        return response()->json([
            'message' => 'Batch de importación creado exitosamente',
            'batch' => $batch->load('files'),
        ], 201);
    }

    public function listarBatches(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $batches = ImportBatch::where('tenant_id', $tenantId)
            ->with(['files'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($batches);
    }

    public function obtenerBatch(int $batchId, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $batch = ImportBatch::where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->with(['files.records'])
            ->firstOrFail();

        $estado = $this->batchService->obtenerEstadoBatch($batch);

        return response()->json($estado);
    }

    public function obtenerArchivo(int $fileId, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $file = ImportFile::whereHas('batch', function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId);
        })
        ->where('id', $fileId)
        ->with(['records' => function ($query) {
            $query->orderBy('fila_numero');
        }])
        ->firstOrFail();

        return response()->json($file);
    }

    public function obtenerRegistros(int $fileId, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $file = ImportFile::whereHas('batch', function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId);
        })
        ->where('id', $fileId)
        ->firstOrFail();

        $estado = $request->query('estado');

        $query = $file->records()->orderBy('fila_numero');

        if ($estado) {
            $query->where('estado_validacion', $estado);
        }

        $registros = $query->paginate(50);

        return response()->json($registros);
    }

    public function actualizarRegistro(int $recordId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'datos_mapeados' => 'required|array',
        ]);

        $tenantId = $request->user()->tenant_id;

        $record = ImportRecord::whereHas('file.batch', function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId);
        })
        ->where('id', $recordId)
        ->firstOrFail();

        $record->update([
            'datos_mapeados' => $validated['datos_mapeados'],
            'estado_validacion' => 'VALIDO',
            'errores_validacion' => [],
        ]);

        return response()->json([
            'message' => 'Registro actualizado exitosamente',
            'record' => $record,
        ]);
    }

    public function confirmarImportacion(int $batchId, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $batch = ImportBatch::where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->firstOrFail();

        return response()->json([
            'message' => 'Importación confirmada. Los registros serán procesados.',
            'batch_id' => $batch->id,
        ]);
    }

    public function cancelarBatch(int $batchId, Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $batch = ImportBatch::where('tenant_id', $tenantId)
            ->where('id', $batchId)
            ->firstOrFail();

        $this->batchService->cancelarBatch($batch);

        return response()->json([
            'message' => 'Batch cancelado exitosamente',
        ]);
    }
}
