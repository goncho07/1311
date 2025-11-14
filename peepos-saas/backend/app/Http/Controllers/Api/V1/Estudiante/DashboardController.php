<?php

namespace App\Http\Controllers\Api\V1\Estudiante;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'kpis' => [
                'promedio' => 0,
                'asistencia' => 0,
                'tareas' => 0,
                'competencias' => 0,
            ],
            'grades_by_area' => [],
            'today_schedule' => [],
            'upcoming_tasks' => [],
            'upcoming_evaluations' => [],
            'achievements' => [],
            'quick_actions' => [
                'ver_horario',
                'ver_tareas',
                'descargar_boleta',
            ],
        ]);
    }
}

