<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Docente\CreateReunionRequest;
use App\Http\Requests\Docente\UpdateReunionRequest;
use App\Http\Resources\ReunionResource;
use App\Services\Docente\ReunionesService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReunionesController extends Controller
{
    protected $reunionesService;

    public function __construct(ReunionesService $reunionesService)
    {
        $this->reunionesService = $reunionesService;
    }

    public function index(Request $request): JsonResponse
    {
        $reuniones = $this->reunionesService->list($request->all());

        return response()->json([
            'data' => ReunionResource::collection($reuniones),
            'meta' => [
                'total' => $reuniones->total(),
                'current_page' => $reuniones->currentPage(),
                'per_page' => $reuniones->perPage()
            ]
        ]);
    }

    public function store(CreateReunionRequest $request): JsonResponse
    {
        $reunion = $this->reunionesService->create($request->validated());

        return response()->json([
            'message' => 'Reunión creada exitosamente',
            'data' => new ReunionResource($reunion)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $reunion = $this->reunionesService->findById($id);

        return response()->json([
            'data' => new ReunionResource($reunion)
        ]);
    }

    public function update(UpdateReunionRequest $request, int $id): JsonResponse
    {
        $reunion = $this->reunionesService->update($id, $request->validated());

        return response()->json([
            'message' => 'Reunión actualizada exitosamente',
            'data' => new ReunionResource($reunion)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->reunionesService->delete($id);

        return response()->json([
            'message' => 'Reunión eliminada exitosamente'
        ]);
    }
}
