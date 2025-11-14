<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstudianteResource;
use App\Services\Docente\EstudianteService;
use Illuminate\Http\JsonResponse;

class EstudianteController extends Controller
{
    protected $estudianteService;

    public function __construct(EstudianteService $estudianteService)
    {
        $this->estudianteService = $estudianteService;
    }

    public function misEstudiantes(): JsonResponse
    {
        $estudiantes = $this->estudianteService->getMisEstudiantes();

        return response()->json([
            'data' => EstudianteResource::collection($estudiantes)
        ]);
    }
}
