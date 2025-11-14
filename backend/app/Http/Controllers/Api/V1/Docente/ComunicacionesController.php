<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Docente\EnviarComunicacionRequest;
use App\Services\Docente\ComunicacionesService;
use Illuminate\Http\JsonResponse;

class ComunicacionesController extends Controller
{
    protected $comunicacionesService;

    public function __construct(ComunicacionesService $comunicacionesService)
    {
        $this->comunicacionesService = $comunicacionesService;
    }

    public function enviar(EnviarComunicacionRequest $request): JsonResponse
    {
        $result = $this->comunicacionesService->enviar($request->validated());

        return response()->json([
            'message' => 'Comunicación enviada exitosamente',
            'data' => $result
        ]);
    }
}
