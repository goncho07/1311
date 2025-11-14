<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use App\Http\Resources\AsistenciaResource;
use App\Services\Apoderado\AsistenciaService;
use Illuminate\Http\JsonResponse;

class AsistenciaController extends Controller
{
    protected $asistenciaService;

    public function __construct(AsistenciaService $asistenciaService)
    {
        $this->asistenciaService = $asistenciaService;
    }

    public function index(int $id): JsonResponse
    {
        $asistencias = $this->asistenciaService->getAsistenciasEstudiante($id);

        return response()->json([
            'data' => AsistenciaResource::collection($asistencias)
        ]);
    }
}
