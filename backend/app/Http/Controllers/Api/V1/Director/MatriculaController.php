<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Http\Requests\Director\CreateMatriculaRequest;
use App\Http\Requests\Director\UpdateMatriculaRequest;
use App\Http\Resources\MatriculaResource;
use App\Services\Director\MatriculaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MatriculaController extends Controller
{
    protected $matriculaService;

    public function __construct(MatriculaService $matriculaService)
    {
        $this->matriculaService = $matriculaService;
    }

    public function index(Request $request): JsonResponse
    {
        $matriculas = $this->matriculaService->list($request->all());

        return response()->json([
            'data' => MatriculaResource::collection($matriculas),
            'meta' => [
                'total' => $matriculas->total(),
                'current_page' => $matriculas->currentPage(),
                'per_page' => $matriculas->perPage()
            ]
        ]);
    }

    public function store(CreateMatriculaRequest $request): JsonResponse
    {
        $matricula = $this->matriculaService->create($request->validated());

        return response()->json([
            'message' => 'Matrícula creada exitosamente',
            'data' => new MatriculaResource($matricula)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $matricula = $this->matriculaService->findById($id);

        return response()->json([
            'data' => new MatriculaResource($matricula)
        ]);
    }

    public function update(UpdateMatriculaRequest $request, int $id): JsonResponse
    {
        $matricula = $this->matriculaService->update($id, $request->validated());

        return response()->json([
            'message' => 'Matrícula actualizada exitosamente',
            'data' => new MatriculaResource($matricula)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->matriculaService->delete($id);

        return response()->json([
            'message' => 'Matrícula eliminada exitosamente'
        ]);
    }

    public function aprobar(int $id): JsonResponse
    {
        $matricula = $this->matriculaService->aprobar($id);

        return response()->json([
            'message' => 'Matrícula aprobada exitosamente',
            'data' => new MatriculaResource($matricula)
        ]);
    }

    public function rechazar(int $id): JsonResponse
    {
        $matricula = $this->matriculaService->rechazar($id);

        return response()->json([
            'message' => 'Matrícula rechazada',
            'data' => new MatriculaResource($matricula)
        ]);
    }
}
