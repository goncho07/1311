<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Services\Director\CuposService;
use Illuminate\Http\JsonResponse;

class CuposController extends Controller
{
    protected $cuposService;

    public function __construct(CuposService $cuposService)
    {
        $this->cuposService = $cuposService;
    }

    public function index(): JsonResponse
    {
        $cupos = $this->cuposService->getCuposDisponibles();

        return response()->json([
            'data' => $cupos
        ]);
    }
}
