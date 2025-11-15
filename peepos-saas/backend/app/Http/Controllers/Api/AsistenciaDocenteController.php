<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Docente;
use App\Models\Seccion;
use App\Models\Estudiante;
use App\Models\Asistencia;
use App\Models\JustificacionInasistencia;
use Carbon\Carbon;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * PEEPOS ATTEND - Controlador de Asistencia para Docentes
 */
class AsistenciaDocenteController extends Controller
{
    /**
     * Obtener estudiantes de una sección para registrar asistencia
     */
    public function getEstudiantesParaAsistencia(Request $request, $seccionId)
    {
        $fecha = $request->query('fecha', Carbon::today()->toDateString());

        $estudiantes = Estudiante::whereHas('matriculas', function ($query) use ($seccionId) {
            $query->where('seccion_id', $seccionId)
                ->where('estado', 'MATRICULADO');
        })
        ->with(['asistencias' => function ($query) use ($fecha) {
            $query->where('fecha', $fecha);
        }])
        ->orderBy('nombre_completo')
        ->get()
        ->map(function ($estudiante) {
            $asistenciaHoy = $estudiante->asistencias->first();

            return [
                'id' => $estudiante->id,
                'codigo' => $estudiante->codigo,
                'nombre_completo' => $estudiante->nombre_completo,
                'foto_perfil' => $estudiante->foto_perfil,
                'asistencia_actual' => $asistenciaHoy->estado ?? null,
                'observaciones' => $asistenciaHoy->observaciones ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'estudiantes' => $estudiantes,
        ]);
    }

    /**
     * Registrar asistencia (modo manual)
     */
    public function registrarAsistencia(Request $request)
    {
        $request->validate([
            'seccion_id' => 'required|exists:secciones,id',
            'fecha' => 'required|date',
            'asistencias' => 'required|array',
            'asistencias.*.estudiante_id' => 'required|exists:estudiantes,id',
            'asistencias.*.estado' => 'required|in:PRESENTE,FALTA,TARDANZA,JUSTIFICADO',
            'asistencias.*.observaciones' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        // Verificar que el docente tenga acceso a esta sección
        if (!$docente->secciones()->where('seccion_id', $request->seccion_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para registrar asistencia en esta sección',
            ], 403);
        }

        foreach ($request->asistencias as $asistenciaData) {
            Asistencia::updateOrCreate(
                [
                    'estudiante_id' => $asistenciaData['estudiante_id'],
                    'fecha' => $request->fecha,
                ],
                [
                    'seccion_id' => $request->seccion_id,
                    'estado' => $asistenciaData['estado'],
                    'observaciones' => $asistenciaData['observaciones'] ?? null,
                    'registrado_por' => $docente->id,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Asistencia registrada correctamente',
        ]);
    }

    /**
     * Generar código QR para registro de asistencia
     */
    public function generarQRAsistencia(Request $request)
    {
        $request->validate([
            'seccion_id' => 'required|exists:secciones,id',
            'fecha' => 'required|date',
        ]);

        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        // Verificar acceso
        if (!$docente->secciones()->where('seccion_id', $request->seccion_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para esta sección',
            ], 403);
        }

        // Generar token temporal (expira en 15 minutos)
        $token = hash('sha256', $request->seccion_id . $request->fecha . time());
        $expiraEn = Carbon::now()->addMinutes(15);

        // Guardar en cache
        \Cache::put("qr_asistencia_{$token}", [
            'seccion_id' => $request->seccion_id,
            'fecha' => $request->fecha,
            'docente_id' => $docente->id,
        ], $expiraEn);

        // Generar QR code (base64)
        $qrUrl = config('app.url') . "/asistencia/qr/{$token}";
        $qrCode = base64_encode(QrCode::format('png')->size(300)->generate($qrUrl));

        return response()->json([
            'success' => true,
            'qr_code' => 'data:image/png;base64,' . $qrCode,
            'expira_en' => $expiraEn->toIso8601String(),
            'token' => $token,
        ]);
    }

    /**
     * Obtener reporte de asistencia
     */
    public function getReporteAsistencia(Request $request)
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        $seccionId = $request->query('seccion_id');
        $mes = $request->query('mes', Carbon::now()->month);
        $anio = $request->query('anio', Carbon::now()->year);

        // Verificar acceso a la sección
        if ($seccionId && !$docente->secciones()->where('seccion_id', $seccionId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para ver esta sección',
            ], 403);
        }

        // Obtener estudiantes de la sección
        $estudiantes = Estudiante::whereHas('matriculas', function ($query) use ($seccionId) {
            $query->where('seccion_id', $seccionId)
                ->where('estado', 'MATRICULADO');
        })
        ->with(['asistencias' => function ($query) use ($mes, $anio) {
            $query->whereYear('fecha', $anio)
                ->whereMonth('fecha', $mes);
        }])
        ->get()
        ->map(function ($estudiante) {
            $asistencias = $estudiante->asistencias;
            $totalDias = $asistencias->count();
            $presentes = $asistencias->where('estado', 'PRESENTE')->count();
            $faltas = $asistencias->where('estado', 'FALTA')->count();
            $tardanzas = $asistencias->where('estado', 'TARDANZA')->count();
            $justificados = $asistencias->where('estado', 'JUSTIFICADO')->count();

            $porcentajeAsistencia = $totalDias > 0
                ? round(($presentes / $totalDias) * 100, 1)
                : 100;

            return [
                'id' => $estudiante->id,
                'codigo' => $estudiante->codigo,
                'nombre_completo' => $estudiante->nombre_completo,
                'total_dias' => $totalDias,
                'presentes' => $presentes,
                'faltas' => $faltas,
                'tardanzas' => $tardanzas,
                'justificados' => $justificados,
                'porcentaje_asistencia' => $porcentajeAsistencia,
                'tendencia' => $porcentajeAsistencia >= 95 ? 'up' : ($porcentajeAsistencia < 85 ? 'down' : 'stable'),
            ];
        });

        // Resumen
        $resumen = [
            'total_estudiantes' => $estudiantes->count(),
            'promedio_asistencia' => $estudiantes->avg('porcentaje_asistencia'),
            'total_presentes' => $estudiantes->sum('presentes'),
            'total_faltas' => $estudiantes->sum('faltas'),
            'total_tardanzas' => $estudiantes->sum('tardanzas'),
            'estudiantes_riesgo' => $estudiantes->where('porcentaje_asistencia', '<', 85)->count(),
        ];

        return response()->json([
            'success' => true,
            'estudiantes' => $estudiantes->values(),
            'resumen' => $resumen,
        ]);
    }

    /**
     * Obtener justificaciones de inasistencia
     */
    public function getJustificaciones(Request $request)
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        $estado = $request->query('estado'); // PENDIENTE, APROBADA, RECHAZADA

        $query = JustificacionInasistencia::whereHas('estudiante.matriculas.seccion', function ($q) use ($docente) {
            $q->whereHas('docentes', function ($dq) use ($docente) {
                $dq->where('docente_id', $docente->id);
            });
        })
        ->with(['estudiante']);

        if ($estado) {
            $query->where('estado', $estado);
        }

        $justificaciones = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($just) {
                return [
                    'id' => $just->id,
                    'estudiante' => [
                        'id' => $just->estudiante->id,
                        'nombre_completo' => $just->estudiante->nombre_completo,
                        'codigo' => $just->estudiante->codigo,
                        'foto_perfil' => $just->estudiante->foto_perfil,
                    ],
                    'fecha_falta' => $just->fecha_falta,
                    'motivo' => $just->motivo,
                    'descripcion' => $just->descripcion,
                    'documento_adjunto' => $just->documento_adjunto,
                    'estado' => $just->estado,
                    'fecha_solicitud' => $just->created_at->toIso8601String(),
                    'observaciones_docente' => $just->observaciones_docente,
                    'procesado_por' => $just->procesado_por,
                    'fecha_procesamiento' => $just->fecha_procesamiento?->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'justificaciones' => $justificaciones,
        ]);
    }

    /**
     * Aprobar justificación
     */
    public function aprobarJustificacion(Request $request, $justificacionId)
    {
        $request->validate([
            'observaciones' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        $justificacion = JustificacionInasistencia::findOrFail($justificacionId);

        $justificacion->update([
            'estado' => 'APROBADA',
            'observaciones_docente' => $request->observaciones,
            'procesado_por' => $docente->id,
            'fecha_procesamiento' => Carbon::now(),
        ]);

        // Actualizar asistencia a JUSTIFICADO
        Asistencia::where('estudiante_id', $justificacion->estudiante_id)
            ->where('fecha', $justificacion->fecha_falta)
            ->update(['estado' => 'JUSTIFICADO']);

        return response()->json([
            'success' => true,
            'message' => 'Justificación aprobada correctamente',
        ]);
    }

    /**
     * Rechazar justificación
     */
    public function rechazarJustificacion(Request $request, $justificacionId)
    {
        $request->validate([
            'observaciones' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        $justificacion = JustificacionInasistencia::findOrFail($justificacionId);

        $justificacion->update([
            'estado' => 'RECHAZADA',
            'observaciones_docente' => $request->observaciones,
            'procesado_por' => $docente->id,
            'fecha_procesamiento' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Justificación rechazada',
        ]);
    }
}
