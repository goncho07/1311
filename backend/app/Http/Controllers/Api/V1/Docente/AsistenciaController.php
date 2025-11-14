<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Docente\RegistrarAsistenciaRequest;
use App\Http\Requests\Docente\RegistrarAsistenciaPorQRRequest;
use App\Http\Resources\AsistenciaResource;
use App\Services\Docente\AsistenciaService;
use Illuminate\Http\JsonResponse;

class AsistenciaController extends Controller
{
    protected $asistenciaService;

    public function __construct(AsistenciaService $asistenciaService)
    {
        $this->asistenciaService = $asistenciaService;
    }

    public function registrar(RegistrarAsistenciaRequest $request): JsonResponse
    {
        $asistencia = $this->asistenciaService->registrar($request->validated());

        return response()->json([
            'message' => 'Asistencia registrada exitosamente',
            'data' => new AsistenciaResource($asistencia)
        ], 201);
    }

    public function registrarPorQR(RegistrarAsistenciaPorQRRequest $request): JsonResponse
    {
        $asistencia = $this->asistenciaService->registrarPorQR($request->validated());

        return response()->json([
            'message' => 'Asistencia registrada por QR exitosamente',
            'data' => new AsistenciaResource($asistencia)
        ], 201);
    }

    public function hoy(): JsonResponse
    {
        $asistencias = $this->asistenciaService->getAsistenciasHoy();

        return response()->json([
            'data' => AsistenciaResource::collection($asistencias)
        ]);
    }
}
