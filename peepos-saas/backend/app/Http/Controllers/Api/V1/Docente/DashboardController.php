<?php

namespace App\Http\Controllers\Api\V1\Docente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $tenantId = $request->user()->tenant_id;

        $sections = 0;
        $students = 0;
        $pendingGrades = 0;

        return response()->json([
            'kpis' => [
                'sections' => $sections,
                'students' => $students,
                'pending_grades' => $pendingGrades,
            ],
            'today_schedule' => [],
            'students_with_alerts' => [],
            'upcoming_evaluations' => [],
            'quick_actions' => [
                'registrar_asistencia',
                'registrar_notas',
                'enviar_comunicado',
            ],
        ]);
    }
}

