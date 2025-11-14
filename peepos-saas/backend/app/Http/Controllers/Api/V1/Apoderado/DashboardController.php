<?php

namespace App\Http\Controllers\Api\V1\Apoderado;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'children' => [],
            'selected_child' => null,
            'kpis' => [
                'promedio' => 0,
                'asistencia' => 0,
                'pagos' => 0,
                'mensajes' => 0,
            ],
            'grades_progress' => [],
            'attendance_calendar' => [],
            'quick_actions' => [
                'descargar_boleta',
                'ver_horario',
                'mensajes',
            ],
        ]);
    }
}

