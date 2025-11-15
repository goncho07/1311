<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Docente;
use App\Models\Seccion;
use App\Models\Estudiante;
use App\Models\Tarea;
use App\Models\Evaluacion;
use Carbon\Carbon;

/**
 * Controlador principal del Panel Docente
 * Dashboard y funcionalidades generales
 */
class DocenteController extends Controller
{
    /**
     * Dashboard del docente
     * KPIs, horario de hoy, alertas, próximas evaluaciones
     */
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        // Obtener secciones a cargo
        $secciones = $docente->secciones()->with('grado')->get();
        $seccionesIds = $secciones->pluck('id');

        // Calcular estudiantes totales
        $estudiantesTotales = Estudiante::whereHas('matriculas', function ($query) use ($seccionesIds) {
            $query->whereIn('seccion_id', $seccionesIds)
                ->where('estado', 'MATRICULADO');
        })->count();

        // Tareas pendientes de calificar
        $tareasPendientes = Tarea::where('docente_id', $docente->id)
            ->whereHas('entregas', function ($query) {
                $query->where('estado', 'ENTREGADO');
            })
            ->count();

        // KPIs
        $kpis = [
            'secciones_a_cargo' => $secciones->count(),
            'estudiantes_totales' => $estudiantesTotales,
            'tareas_pendientes_calificar' => $tareasPendientes,
        ];

        // Horario de hoy
        $hoy = Carbon::now()->locale('es')->dayOfWeek;
        $horarioHoy = $docente->horarios()
            ->where('dia_semana', $hoy)
            ->with(['areaCurricular', 'seccion.grado'])
            ->orderBy('hora_inicio')
            ->get()
            ->map(function ($horario) {
                $horaActual = Carbon::now();
                $horaInicio = Carbon::parse($horario->hora_inicio);
                $horaFin = Carbon::parse($horario->hora_fin);

                return [
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_fin' => $horario->hora_fin,
                    'area' => $horario->areaCurricular->nombre,
                    'grado' => $horario->seccion->grado->nombre,
                    'seccion' => $horario->seccion->nombre,
                    'aula' => $horario->aula ?? 'Sin asignar',
                    'es_clase_actual' => $horaActual->between($horaInicio, $horaFin),
                ];
            });

        // Estudiantes con alertas (bajo rendimiento, inasistencias)
        $estudiantesConAlertas = Estudiante::whereHas('matriculas', function ($query) use ($seccionesIds) {
            $query->whereIn('seccion_id', $seccionesIds)
                ->where('estado', 'MATRICULADO');
        })
        ->with(['matriculas' => function ($query) use ($seccionesIds) {
            $query->whereIn('seccion_id', $seccionesIds);
        }])
        ->get()
        ->filter(function ($estudiante) {
            // Calcular promedio
            $promedio = $estudiante->notas()->avg('calificacion_numerica') ?? 0;

            // Calcular asistencia
            $totalDias = $estudiante->asistencias()->count();
            $presentes = $estudiante->asistencias()->where('estado', 'PRESENTE')->count();
            $porcentajeAsistencia = $totalDias > 0 ? ($presentes / $totalDias) * 100 : 100;

            // Criterios de alerta
            return $promedio < 11 || $porcentajeAsistencia < 85;
        })
        ->take(5)
        ->map(function ($estudiante) {
            $promedio = $estudiante->notas()->avg('calificacion_numerica') ?? 0;
            $totalDias = $estudiante->asistencias()->count();
            $presentes = $estudiante->asistencias()->where('estado', 'PRESENTE')->count();
            $porcentajeAsistencia = $totalDias > 0 ? ($presentes / $totalDias) * 100 : 100;

            $alertas = [];
            $nivelRiesgo = 'bajo';

            if ($promedio < 11) {
                $alertas[] = "Promedio bajo < 11";
                $nivelRiesgo = 'alto';
            }
            if ($porcentajeAsistencia < 85) {
                $alertas[] = "Asistencia < 85%";
                if ($nivelRiesgo !== 'alto') $nivelRiesgo = 'medio';
            }

            return [
                'id' => $estudiante->id,
                'nombre_completo' => $estudiante->nombre_completo,
                'foto_perfil' => $estudiante->foto_perfil,
                'alertas' => $alertas,
                'nivel_riesgo' => $nivelRiesgo,
            ];
        })
        ->values();

        // Próximas evaluaciones (próximos 15 días)
        $proximasEvaluaciones = Evaluacion::where('docente_id', $docente->id)
            ->whereIn('seccion_id', $seccionesIds)
            ->where('fecha_evaluacion', '>=', Carbon::now())
            ->where('fecha_evaluacion', '<=', Carbon::now()->addDays(15))
            ->with(['areaCurricular', 'seccion.grado'])
            ->orderBy('fecha_evaluacion')
            ->limit(5)
            ->get()
            ->map(function ($evaluacion) {
                return [
                    'id' => $evaluacion->id,
                    'titulo' => $evaluacion->titulo,
                    'area' => $evaluacion->areaCurricular->nombre,
                    'grado' => $evaluacion->seccion->grado->nombre,
                    'seccion' => $evaluacion->seccion->nombre,
                    'fecha' => $evaluacion->fecha_evaluacion,
                    'tipo' => $evaluacion->tipo_evaluacion,
                ];
            });

        return response()->json([
            'success' => true,
            'docente' => [
                'nombre_completo' => $docente->nombre_completo,
                'especialidad' => $docente->especialidad,
                'foto_perfil' => $docente->foto_perfil,
            ],
            'kpis' => $kpis,
            'horario_hoy' => $horarioHoy,
            'estudiantes_con_alertas' => $estudiantesConAlertas,
            'proximas_evaluaciones' => $proximasEvaluaciones,
        ]);
    }

    /**
     * Obtener el perfil del docente
     */
    public function getPerfil(Request $request)
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)
            ->with(['secciones.grado'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'docente' => [
                'nombre_completo' => $docente->nombre_completo,
                'codigo' => $docente->codigo,
                'tipo_documento' => $docente->tipo_documento,
                'numero_documento' => $docente->numero_documento,
                'especialidad' => $docente->especialidad,
                'email' => $user->email,
                'telefono' => $docente->telefono,
                'direccion' => $docente->direccion,
                'foto_perfil' => $docente->foto_perfil,
                'fecha_ingreso' => $docente->fecha_ingreso,
            ],
            'secciones' => $docente->secciones->map(function ($seccion) {
                return [
                    'grado' => $seccion->grado->nombre,
                    'seccion' => $seccion->nombre,
                ];
            }),
        ]);
    }

    /**
     * Actualizar perfil (foto principalmente)
     */
    public function actualizarPerfil(Request $request)
    {
        $request->validate([
            'foto_perfil' => 'nullable|image|max:5120', // 5MB max
        ]);

        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        if ($request->hasFile('foto_perfil')) {
            // Eliminar foto anterior si existe
            if ($docente->foto_perfil) {
                \Storage::disk('public')->delete($docente->foto_perfil);
            }

            // Guardar nueva foto
            $path = $request->file('foto_perfil')->store('fotos_perfil/docentes', 'public');
            $docente->foto_perfil = $path;
            $docente->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'foto_perfil' => $docente->foto_perfil,
        ]);
    }

    /**
     * Obtener secciones del docente
     */
    public function getMisSecciones(Request $request)
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        $secciones = $docente->secciones()
            ->with('grado')
            ->get()
            ->map(function ($seccion) {
                return [
                    'id' => $seccion->id,
                    'nombre' => $seccion->nombre,
                    'grado' => $seccion->grado->nombre,
                    'nivel' => $seccion->grado->nivel,
                    'total_estudiantes' => $seccion->estudiantes()->count(),
                ];
            });

        return response()->json([
            'success' => true,
            'secciones' => $secciones,
        ]);
    }

    /**
     * Obtener horario del docente
     */
    public function getHorario(Request $request)
    {
        $user = Auth::user();
        $docente = Docente::where('user_id', $user->id)->firstOrFail();

        $horario = $docente->horarios()
            ->with(['areaCurricular', 'seccion.grado'])
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get()
            ->map(function ($h) {
                $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

                return [
                    'hora_inicio' => substr($h->hora_inicio, 0, 5), // HH:MM
                    'hora_fin' => substr($h->hora_fin, 0, 5),
                    'dia' => $dias[$h->dia_semana] ?? 'Lunes',
                    'area' => $h->areaCurricular->nombre,
                    'grado' => $h->seccion->grado->nombre,
                    'seccion' => $h->seccion->nombre,
                    'aula' => $h->aula ?? 'Sin asignar',
                ];
            });

        return response()->json([
            'success' => true,
            'horario' => $horario,
        ]);
    }
}
