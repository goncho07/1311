<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Http\Requests\Director\GenerateReportRequest;
use App\Services\Director\ReportesService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportesController extends Controller
{
    protected $reportesService;

    public function __construct(ReportesService $reportesService)
    {
        $this->reportesService = $reportesService;
    }

    public function estadisticas(): JsonResponse
    {
        $estadisticas = $this->reportesService->getEstadisticas();

        return response()->json([
            'data' => $estadisticas
        ]);
    }

    public function generar(GenerateReportRequest $request): StreamedResponse
    {
        return $this->reportesService->generateReport($request->validated());
    }

    public function exportSIAGIE(): StreamedResponse
    {
        return $this->reportesService->exportToSIAGIE();
    }
}
