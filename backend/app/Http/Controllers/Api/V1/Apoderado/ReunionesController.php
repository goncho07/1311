<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReunionResource;
use App\Services\Apoderado\ReunionesService;
use Illuminate\Http\JsonResponse;

class ReunionesController extends Controller
{
    protected $reunionesService;

    public function __construct(ReunionesService $reunionesService)
    {
        $this->reunionesService = $reunionesService;
    }

    public function misReuniones(): JsonResponse
    {
        $reuniones = $this->reunionesService->getMisReuniones();

        return response()->json([
            'data' => ReunionResource::collection($reuniones)
        ]);
    }
}
