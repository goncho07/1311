<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Docente\CreateEvaluacionRequest;
use App\Http\Requests\Docente\UpdateEvaluacionRequest;
use App\Http\Requests\Docente\RegistroMasivoEvaluacionRequest;
use App\Http\Resources\EvaluacionResource;
use App\Services\Docente\EvaluacionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EvaluacionController extends Controller
{
    protected $evaluacionService;

    public function __construct(EvaluacionService $evaluacionService)
    {
        $this->evaluacionService = $evaluacionService;
    }

    public function index(Request $request): JsonResponse
    {
        $evaluaciones = $this->evaluacionService->list($request->all());

        return response()->json([
            'data' => EvaluacionResource::collection($evaluaciones),
            'meta' => [
                'total' => $evaluaciones->total(),
                'current_page' => $evaluaciones->currentPage(),
                'per_page' => $evaluaciones->perPage()
            ]
        ]);
    }

    public function store(CreateEvaluacionRequest $request): JsonResponse
    {
        $evaluacion = $this->evaluacionService->create($request->validated());

        return response()->json([
            'message' => 'Evaluación creada exitosamente',
            'data' => new EvaluacionResource($evaluacion)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $evaluacion = $this->evaluacionService->findById($id);

        return response()->json([
            'data' => new EvaluacionResource($evaluacion)
        ]);
    }

    public function update(UpdateEvaluacionRequest $request, int $id): JsonResponse
    {
        $evaluacion = $this->evaluacionService->update($id, $request->validated());

        return response()->json([
            'message' => 'Evaluación actualizada exitosamente',
            'data' => new EvaluacionResource($evaluacion)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->evaluacionService->delete($id);

        return response()->json([
            'message' => 'Evaluación eliminada exitosamente'
        ]);
    }

    public function registroMasivo(RegistroMasivoEvaluacionRequest $request): JsonResponse
    {
        $result = $this->evaluacionService->registroMasivo($request->validated());

        return response()->json([
            'message' => 'Evaluaciones registradas exitosamente',
            'data' => $result
        ]);
    }
}
