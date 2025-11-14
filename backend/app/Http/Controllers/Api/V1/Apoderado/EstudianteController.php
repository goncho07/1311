<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstudianteResource;
use App\Services\Apoderado\EstudianteService;
use Illuminate\Http\JsonResponse;

class EstudianteController extends Controller
{
    protected $estudianteService;

    public function __construct(EstudianteService $estudianteService)
    {
        $this->estudianteService = $estudianteService;
    }

    public function index(): JsonResponse
    {
        $estudiantes = $this->estudianteService->getMisHijos();

        return response()->json([
            'data' => EstudianteResource::collection($estudiantes)
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $estudiante = $this->estudianteService->findById($id);

        return response()->json([
            'data' => new EstudianteResource($estudiante)
        ]);
    }
}
