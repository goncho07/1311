<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Http\Requests\Director\CreateImportBatchRequest;
use App\Http\Requests\Director\ProcessImportBatchRequest;
use App\Http\Resources\ImportBatchResource;
use App\Services\Director\ImportService;
use Illuminate\Http\JsonResponse;

class ImportController extends Controller
{
    protected $importService;

    public function __construct(ImportService $importService)
    {
        $this->importService = $importService;
    }

    public function createBatch(CreateImportBatchRequest $request): JsonResponse
    {
        $batch = $this->importService->createBatch($request->validated());

        return response()->json([
            'message' => 'Lote de importación creado exitosamente',
            'data' => new ImportBatchResource($batch)
        ], 201);
    }

    public function getBatchStatus(int $id): JsonResponse
    {
        $batch = $this->importService->getBatchStatus($id);

        return response()->json([
            'data' => new ImportBatchResource($batch)
        ]);
    }

    public function processBatch(ProcessImportBatchRequest $request, int $id): JsonResponse
    {
        $result = $this->importService->processBatch($id, $request->validated());

        return response()->json([
            'message' => 'Lote procesado exitosamente',
            'data' => $result
        ]);
    }
}
