<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use App\Http\Requests\Apoderado\RegistrarPagoRequest;
use App\Http\Resources\PagoResource;
use App\Services\Apoderado\PagosService;
use Illuminate\Http\JsonResponse;

class PagosController extends Controller
{
    protected $pagosService;

    public function __construct(PagosService $pagosService)
    {
        $this->pagosService = $pagosService;
    }

    public function pendientes(): JsonResponse
    {
        $pagos = $this->pagosService->getPagosPendientes();

        return response()->json([
            'data' => PagoResource::collection($pagos)
        ]);
    }

    public function registrar(RegistrarPagoRequest $request): JsonResponse
    {
        $pago = $this->pagosService->registrarPago($request->validated());

        return response()->json([
            'message' => 'Pago registrado exitosamente',
            'data' => new PagoResource($pago)
        ], 201);
    }
}
