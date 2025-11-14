<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotaResource;
use App\Services\Apoderado\NotasService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotasController extends Controller
{
    protected $notasService;

    public function __construct(NotasService $notasService)
    {
        $this->notasService = $notasService;
    }

    public function index(int $id): JsonResponse
    {
        $notas = $this->notasService->getNotasEstudiante($id);

        return response()->json([
            'data' => NotaResource::collection($notas)
        ]);
    }

    public function descargarBoleta(int $id, string $periodo, string $bimestre): StreamedResponse
    {
        return $this->notasService->generarBoleta($id, $periodo, $bimestre);
    }
}
