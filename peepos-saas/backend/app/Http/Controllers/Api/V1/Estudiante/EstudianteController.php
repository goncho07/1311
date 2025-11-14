<?php

namespace App\Http\Controllers\Api\V1\Estudiante;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\Evaluacion;
use App\Models\Tarea;
use App\Models\EntregaTarea;
use App\Models\Asistencia;
use App\Models\HorarioClase;
use App\Models\Matricula;
use App\Services\Academic\BoletaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class EstudianteController extends Controller
{
    protected $boletaService;

    public function __construct(BoletaService $boletaService)
    {
        $this->boletaService = $boletaService;
    }

    /**
     * 📊 GET MI DASHBOARD - Vista general del estudiante
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMiDashboard(Request $request)
    {
        try {
            $userId = $request->user()->id;

            // Obtener estudiante actual
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            // Obtener matrícula activa
            $matriculaActiva = $estudiante->matriculas()
                ->where('estado', 'ACTIVA')
                ->with('periodoAcademico')
                ->latest()
                ->first();

            if (!$matriculaActiva) {
                return response()->json([
                    'message' => 'No tienes una matrícula activa',
                    'kpis' => [
                        'promedio_general' => 0,
                        'asistencia_porcentaje' => 0,
                        'tareas_pendientes' => 0,
                        'competencias_logradas' => 0,
                    ],
                ], 200);
            }

            // 📈 CALCULAR KPIs

            // 1. Promedio General (escala vigesimal 0-20)
            $promedioGeneral = Evaluacion::where('estudiante_id', $estudiante->id)
                ->where('periodo_academico_id', $matriculaActiva->periodo_academico_id)
                ->active()
                ->avg('calificacion_numerica') ?? 0;

            // 2. Porcentaje de Asistencia
            $totalAsistencias = Asistencia::where('estudiante_id', $estudiante->id)
                ->where('periodo_academico_id', $matriculaActiva->periodo_academico_id)
                ->count();

            $asistenciasPresentes = Asistencia::where('estudiante_id', $estudiante->id)
                ->where('periodo_academico_id', $matriculaActiva->periodo_academico_id)
                ->where('estado', 'PRESENTE')
                ->count();

            $porcentajeAsistencia = $totalAsistencias > 0
                ? round(($asistenciasPresentes / $totalAsistencias) * 100, 2)
                : 0;

            // 3. Tareas Pendientes
            $tareasPendientes = Tarea::where('grado', $matriculaActiva->grado)
                ->where('seccion', $matriculaActiva->seccion)
                ->where('fecha_entrega', '>', now())
                ->whereDoesntHave('entregas', function($query) use ($estudiante) {
                    $query->where('estudiante_id', $estudiante->id);
                })
                ->count();

            // 4. Competencias Logradas (con nivel AD o A)
            $competenciasLogradas = Evaluacion::where('estudiante_id', $estudiante->id)
                ->where('periodo_academico_id', $matriculaActiva->periodo_academico_id)
                ->whereIn('calificacion_literal', ['AD', 'A'])
                ->distinct('competencia_minedu_id')
                ->count();

            // 📚 NOTAS POR ÁREA (últimas evaluaciones)
            $notasPorArea = Evaluacion::where('estudiante_id', $estudiante->id)
                ->where('periodo_academico_id', $matriculaActiva->periodo_academico_id)
                ->with(['areaCurricular', 'competencia'])
                ->select('area_curricular_id', DB::raw('AVG(calificacion_numerica) as promedio'), DB::raw('COUNT(DISTINCT competencia_minedu_id) as competencias_logradas'))
                ->groupBy('area_curricular_id')
                ->get()
                ->map(function($nota) {
                    return [
                        'area' => $nota->areaCurricular->nombre ?? 'Sin área',
                        'promedio' => round($nota->promedio, 1),
                        'competencias_logradas' => $nota->competencias_logradas,
                        'calificacion_literal' => $this->convertirALiteral($nota->promedio),
                    ];
                });

            // 🕐 HORARIO DE HOY
            $diaSemana = now()->dayOfWeek; // 0=domingo, 1=lunes...
            $horarioHoy = HorarioClase::where('grado', $matriculaActiva->grado)
                ->where('seccion', $matriculaActiva->seccion)
                ->where('dia_semana', $diaSemana)
                ->with(['areaCurricular', 'docente'])
                ->orderBy('hora_inicio')
                ->get()
                ->map(function($clase) {
                    return [
                        'hora' => Carbon::parse($clase->hora_inicio)->format('H:i'),
                        'area' => $clase->areaCurricular->nombre ?? 'Sin asignar',
                        'docente' => $clase->docente->nombre_completo ?? 'Sin docente',
                        'aula' => $clase->aula ?? 'Por definir',
                    ];
                });

            // 📝 TAREAS PRÓXIMAS (próximas 7 días)
            $tareasProximas = Tarea::where('grado', $matriculaActiva->grado)
                ->where('seccion', $matriculaActiva->seccion)
                ->whereBetween('fecha_entrega', [now(), now()->addDays(7)])
                ->whereDoesntHave('entregas', function($query) use ($estudiante) {
                    $query->where('estudiante_id', $estudiante->id);
                })
                ->with('areaCurricular')
                ->orderBy('fecha_entrega')
                ->limit(5)
                ->get()
                ->map(function($tarea) {
                    return [
                        'id' => $tarea->uuid,
                        'titulo' => $tarea->titulo,
                        'area' => $tarea->areaCurricular->nombre ?? 'Sin área',
                        'fecha_entrega' => $tarea->fecha_entrega->format('Y-m-d H:i'),
                        'dias_restantes' => now()->diffInDays($tarea->fecha_entrega),
                    ];
                });

            // 📅 PRÓXIMAS EVALUACIONES
            $proximasEvaluaciones = Tarea::where('grado', $matriculaActiva->grado)
                ->where('seccion', $matriculaActiva->seccion)
                ->where('tipo', 'EVALUACION')
                ->where('fecha_entrega', '>', now())
                ->with('areaCurricular')
                ->orderBy('fecha_entrega')
                ->limit(5)
                ->get()
                ->map(function($evaluacion) {
                    return [
                        'id' => $evaluacion->uuid,
                        'titulo' => $evaluacion->titulo,
                        'area' => $evaluacion->areaCurricular->nombre ?? 'Sin área',
                        'fecha' => $evaluacion->fecha_entrega->format('Y-m-d'),
                        'tipo' => $evaluacion->metadata['tipo'] ?? 'Evaluación',
                    ];
                });

            return response()->json([
                'success' => true,
                'estudiante' => [
                    'nombre_completo' => $estudiante->nombre_completo,
                    'codigo' => $estudiante->codigo_estudiante,
                    'grado' => $matriculaActiva->grado,
                    'seccion' => $matriculaActiva->seccion,
                    'foto_perfil' => $estudiante->foto_perfil,
                ],
                'kpis' => [
                    'promedio_general' => round($promedioGeneral, 1),
                    'asistencia_porcentaje' => $porcentajeAsistencia,
                    'tareas_pendientes' => $tareasPendientes,
                    'competencias_logradas' => $competenciasLogradas,
                ],
                'notas_por_area' => $notasPorArea,
                'horario_hoy' => $horarioHoy,
                'tareas_proximas' => $tareasProximas,
                'proximas_evaluaciones' => $proximasEvaluaciones,
                'quick_actions' => [
                    ['label' => 'Ver Horario', 'route' => '/estudiante/horario', 'icon' => 'calendar'],
                    ['label' => 'Mis Tareas', 'route' => '/estudiante/tareas', 'icon' => 'clipboard'],
                    ['label' => 'Descargar Boleta', 'route' => '/estudiante/boleta', 'icon' => 'download'],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener dashboard',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📖 GET MIS NOTAS - Todas las notas del estudiante
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMisNotas(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            $bimestre = $request->query('bimestre'); // Filtro opcional
            $areaId = $request->query('area_id'); // Filtro opcional

            $query = Evaluacion::where('estudiante_id', $estudiante->id)
                ->with(['areaCurricular', 'competencia', 'docente'])
                ->active();

            if ($bimestre) {
                $query->where('bimestre', $bimestre);
            }

            if ($areaId) {
                $query->where('area_curricular_id', $areaId);
            }

            $evaluaciones = $query->orderBy('fecha_evaluacion', 'desc')->get();

            // Agrupar por área curricular
            $notasAgrupadas = $evaluaciones->groupBy('area_curricular_id')->map(function($notasArea) {
                return [
                    'area' => $notasArea->first()->areaCurricular->nombre ?? 'Sin área',
                    'promedio' => round($notasArea->avg('calificacion_numerica'), 1),
                    'evaluaciones' => $notasArea->map(function($evaluacion) {
                        return [
                            'competencia' => $evaluacion->competencia->nombre ?? 'Sin competencia',
                            'calificacion_literal' => $evaluacion->calificacion_literal,
                            'calificacion_numerica' => $evaluacion->calificacion_numerica,
                            'descripcion_logro' => $evaluacion->descripcion_logro,
                            'fecha' => $evaluacion->fecha_evaluacion->format('Y-m-d'),
                            'bimestre' => $evaluacion->bimestre,
                        ];
                    }),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'notas' => $notasAgrupadas,
                'promedio_general' => round($evaluaciones->avg('calificacion_numerica'), 1),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener notas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📝 GET MIS TAREAS - Lista de tareas del estudiante
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMisTareas(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();
            $matricula = $estudiante->matriculas()->where('estado', 'ACTIVA')->latest()->first();

            if (!$matricula) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes matrícula activa',
                ], 404);
            }

            $filtro = $request->query('filtro', 'pendientes'); // pendientes, entregadas, vencidas, todas

            $query = Tarea::where('grado', $matricula->grado)
                ->where('seccion', $matricula->seccion)
                ->with(['areaCurricular', 'docente']);

            // Aplicar filtros
            switch ($filtro) {
                case 'pendientes':
                    $query->where('fecha_entrega', '>', now())
                        ->whereDoesntHave('entregas', function($q) use ($estudiante) {
                            $q->where('estudiante_id', $estudiante->id);
                        });
                    break;
                case 'entregadas':
                    $query->whereHas('entregas', function($q) use ($estudiante) {
                        $q->where('estudiante_id', $estudiante->id);
                    });
                    break;
                case 'vencidas':
                    $query->where('fecha_entrega', '<', now())
                        ->whereDoesntHave('entregas', function($q) use ($estudiante) {
                            $q->where('estudiante_id', $estudiante->id);
                        });
                    break;
            }

            $tareas = $query->orderBy('fecha_entrega', 'asc')->get()->map(function($tarea) use ($estudiante) {
                $entrega = EntregaTarea::where('tarea_id', $tarea->id)
                    ->where('estudiante_id', $estudiante->id)
                    ->first();

                return [
                    'id' => $tarea->uuid,
                    'titulo' => $tarea->titulo,
                    'descripcion' => $tarea->descripcion,
                    'area' => $tarea->areaCurricular->nombre ?? 'Sin área',
                    'docente' => $tarea->docente->nombre_completo ?? 'Sin asignar',
                    'fecha_asignacion' => $tarea->fecha_asignacion->format('Y-m-d'),
                    'fecha_entrega' => $tarea->fecha_entrega->format('Y-m-d H:i'),
                    'puntos_maximos' => $tarea->puntos_maximos,
                    'estado' => $this->determinarEstadoTarea($tarea, $entrega),
                    'entregado' => !is_null($entrega),
                    'calificacion' => $entrega ? $entrega->puntos_obtenidos : null,
                ];
            });

            return response()->json([
                'success' => true,
                'tareas' => $tareas,
                'total' => $tareas->count(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tareas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🔍 GET TAREA DETALLE - Detalle completo de una tarea
     *
     * @param Request $request
     * @param string $tareaId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTareaDetalle(Request $request, string $tareaId)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            $tarea = Tarea::where('uuid', $tareaId)
                ->with(['areaCurricular', 'docente'])
                ->firstOrFail();

            $entrega = EntregaTarea::where('tarea_id', $tarea->id)
                ->where('estudiante_id', $estudiante->id)
                ->first();

            return response()->json([
                'success' => true,
                'tarea' => [
                    'id' => $tarea->uuid,
                    'titulo' => $tarea->titulo,
                    'descripcion' => $tarea->descripcion,
                    'instrucciones' => $tarea->instrucciones,
                    'area' => $tarea->areaCurricular->nombre ?? 'Sin área',
                    'docente' => $tarea->docente->nombre_completo ?? 'Sin asignar',
                    'tipo' => $tarea->tipo,
                    'fecha_asignacion' => $tarea->fecha_asignacion->format('Y-m-d H:i'),
                    'fecha_entrega' => $tarea->fecha_entrega->format('Y-m-d H:i'),
                    'permite_entrega_tardia' => $tarea->permite_entrega_tardia,
                    'puntos_maximos' => $tarea->puntos_maximos,
                    'peso' => $tarea->peso,
                    'archivos_adjuntos' => $tarea->archivos_adjuntos,
                    'rubrica' => $tarea->rubrica,
                ],
                'entrega' => $entrega ? [
                    'id' => $entrega->uuid,
                    'fecha_entrega' => $entrega->fecha_entrega->format('Y-m-d H:i'),
                    'contenido' => $entrega->contenido,
                    'archivos' => $entrega->archivos,
                    'estado' => $entrega->estado,
                    'puntos_obtenidos' => $entrega->puntos_obtenidos,
                    'retroalimentacion' => $entrega->retroalimentacion,
                    'fecha_revision' => $entrega->fecha_revision ? $entrega->fecha_revision->format('Y-m-d H:i') : null,
                ] : null,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle de tarea',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📤 ENTREGAR TAREA - Enviar entrega de tarea con archivos
     *
     * @param Request $request
     * @param string $tareaId
     * @return \Illuminate\Http\JsonResponse
     */
    public function entregarTarea(Request $request, string $tareaId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'contenido' => 'required|string',
                'archivos.*' => 'nullable|file|max:10240', // 10MB max por archivo
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            $tarea = Tarea::where('uuid', $tareaId)->firstOrFail();

            // Verificar si ya entregó
            $entregaExistente = EntregaTarea::where('tarea_id', $tarea->id)
                ->where('estudiante_id', $estudiante->id)
                ->first();

            if ($entregaExistente && $entregaExistente->estado !== 'PENDIENTE') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya has entregado esta tarea',
                ], 400);
            }

            // Verificar fecha de entrega
            if ($tarea->fecha_entrega < now() && !$tarea->permite_entrega_tardia) {
                return response()->json([
                    'success' => false,
                    'message' => 'La fecha de entrega ha expirado',
                ], 400);
            }

            // Procesar archivos adjuntos
            $archivosGuardados = [];
            if ($request->hasFile('archivos')) {
                foreach ($request->file('archivos') as $archivo) {
                    $path = $archivo->store('entregas_tareas/' . $tarea->uuid, 'public');
                    $archivosGuardados[] = [
                        'nombre' => $archivo->getClientOriginalName(),
                        'ruta' => $path,
                        'tamano' => $archivo->getSize(),
                        'tipo' => $archivo->getClientMimeType(),
                    ];
                }
            }

            // Crear o actualizar entrega
            $entrega = EntregaTarea::updateOrCreate(
                [
                    'tarea_id' => $tarea->id,
                    'estudiante_id' => $estudiante->id,
                ],
                [
                    'fecha_entrega' => now(),
                    'contenido' => $request->contenido,
                    'archivos' => $archivosGuardados,
                    'estado' => 'ENTREGADA',
                    'entregada_tarde' => $tarea->fecha_entrega < now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Tarea entregada exitosamente',
                'entrega' => [
                    'id' => $entrega->uuid,
                    'fecha_entrega' => $entrega->fecha_entrega->format('Y-m-d H:i'),
                    'estado' => $entrega->estado,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al entregar tarea',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🕐 GET MI HORARIO - Horario semanal completo
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMiHorario(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();
            $matricula = $estudiante->matriculas()->where('estado', 'ACTIVA')->latest()->first();

            if (!$matricula) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes matrícula activa',
                ], 404);
            }

            $horario = HorarioClase::where('grado', $matricula->grado)
                ->where('seccion', $matricula->seccion)
                ->with(['areaCurricular', 'docente'])
                ->orderBy('dia_semana')
                ->orderBy('hora_inicio')
                ->get()
                ->groupBy('dia_semana')
                ->map(function($clasesDia, $dia) {
                    return [
                        'dia' => $this->nombreDia($dia),
                        'clases' => $clasesDia->map(function($clase) {
                            return [
                                'hora_inicio' => Carbon::parse($clase->hora_inicio)->format('H:i'),
                                'hora_fin' => Carbon::parse($clase->hora_fin)->format('H:i'),
                                'area' => $clase->areaCurricular->nombre ?? 'Sin área',
                                'docente' => $clase->docente->nombre_completo ?? 'Sin docente',
                                'aula' => $clase->aula ?? 'Por definir',
                            ];
                        }),
                    ];
                });

            return response()->json([
                'success' => true,
                'horario' => $horario->values(),
                'grado' => $matricula->grado,
                'seccion' => $matricula->seccion,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener horario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📅 GET MI ASISTENCIA - Registro de asistencia con calendario
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMiAsistencia(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            $mes = $request->query('mes', now()->month);
            $anio = $request->query('anio', now()->year);

            $asistencias = Asistencia::where('estudiante_id', $estudiante->id)
                ->whereMonth('fecha', $mes)
                ->whereYear('fecha', $anio)
                ->orderBy('fecha')
                ->get()
                ->map(function($asistencia) {
                    return [
                        'fecha' => $asistencia->fecha->format('Y-m-d'),
                        'estado' => $asistencia->estado, // PRESENTE, FALTA, TARDANZA, JUSTIFICADA
                        'hora_registro' => $asistencia->hora_registro ? Carbon::parse($asistencia->hora_registro)->format('H:i') : null,
                        'observaciones' => $asistencia->observaciones,
                    ];
                });

            // Resumen del mes
            $totalDias = $asistencias->count();
            $presentes = $asistencias->where('estado', 'PRESENTE')->count();
            $faltas = $asistencias->where('estado', 'FALTA')->count();
            $tardanzas = $asistencias->where('estado', 'TARDANZA')->count();
            $justificadas = $asistencias->where('estado', 'JUSTIFICADA')->count();

            return response()->json([
                'success' => true,
                'asistencias' => $asistencias,
                'resumen' => [
                    'total_dias' => $totalDias,
                    'presentes' => $presentes,
                    'faltas' => $faltas,
                    'tardanzas' => $tardanzas,
                    'justificadas' => $justificadas,
                    'porcentaje_asistencia' => $totalDias > 0 ? round(($presentes / $totalDias) * 100, 2) : 0,
                ],
                'mes' => $mes,
                'anio' => $anio,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asistencia',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📆 GET PRÓXIMAS EVALUACIONES - Evaluaciones programadas
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProximasEvaluaciones(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();
            $matricula = $estudiante->matriculas()->where('estado', 'ACTIVA')->latest()->first();

            if (!$matricula) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes matrícula activa',
                ], 404);
            }

            $evaluaciones = Tarea::where('grado', $matricula->grado)
                ->where('seccion', $matricula->seccion)
                ->where('tipo', 'EVALUACION')
                ->where('fecha_entrega', '>', now())
                ->with(['areaCurricular', 'docente'])
                ->orderBy('fecha_entrega')
                ->get()
                ->map(function($evaluacion) {
                    return [
                        'id' => $evaluacion->uuid,
                        'titulo' => $evaluacion->titulo,
                        'area' => $evaluacion->areaCurricular->nombre ?? 'Sin área',
                        'docente' => $evaluacion->docente->nombre_completo ?? 'Sin asignar',
                        'fecha' => $evaluacion->fecha_entrega->format('Y-m-d'),
                        'hora' => $evaluacion->fecha_entrega->format('H:i'),
                        'tipo' => $evaluacion->metadata['tipo'] ?? 'Evaluación',
                        'temas' => $evaluacion->metadata['temas'] ?? [],
                        'materiales' => $evaluacion->metadata['materiales'] ?? [],
                        'descripcion' => $evaluacion->descripcion,
                    ];
                });

            return response()->json([
                'success' => true,
                'evaluaciones' => $evaluaciones,
                'total' => $evaluaciones->count(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluaciones',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 👤 GET MI PERFIL - Datos personales del estudiante
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMiPerfil(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)
                ->with(['apoderados', 'matriculas.periodoAcademico'])
                ->firstOrFail();

            $matriculaActiva = $estudiante->matriculas->where('estado', 'ACTIVA')->first();

            return response()->json([
                'success' => true,
                'estudiante' => [
                    'nombre_completo' => $estudiante->nombre_completo,
                    'codigo' => $estudiante->codigo_estudiante,
                    'tipo_documento' => $estudiante->tipo_documento,
                    'numero_documento' => $estudiante->numero_documento,
                    'fecha_nacimiento' => $estudiante->fecha_nacimiento->format('Y-m-d'),
                    'edad' => $estudiante->edad,
                    'genero' => $estudiante->genero,
                    'direccion' => $estudiante->direccion,
                    'distrito' => $estudiante->distrito,
                    'telefono_emergencia' => $estudiante->telefono_emergencia,
                    'foto_perfil' => $estudiante->foto_perfil,
                ],
                'matricula' => $matriculaActiva ? [
                    'grado' => $matriculaActiva->grado,
                    'seccion' => $matriculaActiva->seccion,
                    'nivel' => $matriculaActiva->nivel,
                    'periodo' => $matriculaActiva->periodoAcademico->nombre ?? 'N/A',
                ] : null,
                'apoderados' => $estudiante->apoderados->map(function($apoderado) {
                    return [
                        'nombre_completo' => $apoderado->nombre_completo,
                        'tipo_relacion' => $apoderado->pivot->tipo_relacion,
                        'telefono' => $apoderado->telefono_principal,
                        'email' => $apoderado->email,
                    ];
                }),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener perfil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ✏️ ACTUALIZAR PERFIL - Actualizar foto y datos limitados
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function actualizarPerfil(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'foto_perfil' => 'nullable|image|max:2048', // 2MB max
                'telefono_emergencia' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            // Actualizar foto de perfil
            if ($request->hasFile('foto_perfil')) {
                // Eliminar foto anterior
                if ($estudiante->foto_perfil) {
                    Storage::disk('public')->delete($estudiante->foto_perfil);
                }

                $path = $request->file('foto_perfil')->store('estudiantes/fotos', 'public');
                $estudiante->foto_perfil = $path;
            }

            // Actualizar teléfono de emergencia (solo este campo permite el estudiante)
            if ($request->has('telefono_emergencia')) {
                $estudiante->telefono_emergencia = $request->telefono_emergencia;
            }

            $estudiante->save();

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado correctamente',
                'estudiante' => [
                    'foto_perfil' => $estudiante->foto_perfil,
                    'telefono_emergencia' => $estudiante->telefono_emergencia,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar perfil',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📄 DESCARGAR BOLETA - Generar y descargar PDF de boleta
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function descargarBoleta(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $estudiante = Estudiante::where('usuario_id', $userId)->firstOrFail();

            $periodoId = $request->query('periodo_id');
            $bimestre = $request->query('bimestre');

            if (!$periodoId || !$bimestre) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debes especificar periodo y bimestre',
                ], 400);
            }

            // Generar PDF usando BoletaService
            $pdf = $this->boletaService->generarBoletaEstudiante($estudiante->id, $periodoId, $bimestre);

            $nombreArchivo = "boleta_{$estudiante->codigo_estudiante}_{$bimestre}.pdf";

            return response($pdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', "attachment; filename=\"{$nombreArchivo}\"");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar boleta',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // MÉTODOS AUXILIARES
    // ═══════════════════════════════════════════════════════════════

    private function convertirALiteral(float $nota): string
    {
        if ($nota >= 18) return 'AD';
        if ($nota >= 14) return 'A';
        if ($nota >= 11) return 'B';
        return 'C';
    }

    private function determinarEstadoTarea($tarea, $entrega): string
    {
        if ($entrega) {
            return $entrega->estado; // ENTREGADA, REVISADA, etc.
        }

        if ($tarea->fecha_entrega < now()) {
            return 'VENCIDA';
        }

        return 'PENDIENTE';
    }

    private function nombreDia(int $dia): string
    {
        $dias = [
            0 => 'Domingo',
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
        ];

        return $dias[$dia] ?? 'Desconocido';
    }
}
