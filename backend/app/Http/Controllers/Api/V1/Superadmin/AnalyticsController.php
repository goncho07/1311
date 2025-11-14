<?php

namespace App\Http\Controllers\Api\V1\Superadmin;

use App\Http\Controllers\Controller;
use App\Services\Superadmin\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(): JsonResponse
    {
        $analytics = $this->analyticsService->getGlobalAnalytics();

        return response()->json([
            'data' => $analytics
        ]);
    }
}
