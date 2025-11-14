<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificacionResource;
use App\Services\Apoderado\NotificacionesService;
use Illuminate\Http\JsonResponse;

class NotificacionesController extends Controller
{
    protected $notificacionesService;

    public function __construct(NotificacionesService $notificacionesService)
    {
        $this->notificacionesService = $notificacionesService;
    }

    public function index(): JsonResponse
    {
        $notificaciones = $this->notificacionesService->getMisNotificaciones();

        return response()->json([
            'data' => NotificacionResource::collection($notificaciones)
        ]);
    }
}
