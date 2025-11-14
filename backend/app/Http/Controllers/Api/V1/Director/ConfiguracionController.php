<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Http\Requests\Director\UpdateConfiguracionRequest;
use App\Services\Director\ConfiguracionService;
use Illuminate\Http\JsonResponse;

class ConfiguracionController extends Controller
{
    protected $configuracionService;

    public function __construct(ConfiguracionService $configuracionService)
    {
        $this->configuracionService = $configuracionService;
    }

    public function index(): JsonResponse
    {
        $configuracion = $this->configuracionService->getConfiguracion();

        return response()->json([
            'data' => $configuracion
        ]);
    }

    public function update(UpdateConfiguracionRequest $request): JsonResponse
    {
        $configuracion = $this->configuracionService->updateConfiguracion($request->validated());

        return response()->json([
            'message' => 'Configuración actualizada exitosamente',
            'data' => $configuracion
        ]);
    }
}
