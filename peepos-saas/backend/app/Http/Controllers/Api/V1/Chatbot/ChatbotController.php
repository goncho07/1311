<?php

namespace App\Http\Controllers\Api\V1\Chatbot;

use App\Http\Controllers\Controller;
use App\Models\Apoderado;
use App\Models\Estudiante;
use App\Models\HorarioClase;
use App\Models\Evaluacion;
use App\Models\Asistencia;
use App\Models\CuentaPorCobrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT CONTROLLER - Endpoints para integración con N8N
 * ═══════════════════════════════════════════════════════════════
 *
 * Este controller provee endpoints para el chatbot de WhatsApp
 * que funciona a través de N8N.
 *
 * Flow:
 * 1. Apoderado envía mensaje al bot WhatsApp
 * 2. WAHA recibe mensaje y envía webhook a N8N
 * 3. N8N consulta estos endpoints para obtener información
 * 4. N8N formatea respuesta y envía via WAHA
 */
class ChatbotController extends Controller
{
    /**
     * 🔐 Validar usuario autorizado (whitelist)
     *
     * POST /api/v1/chatbot/validate-user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'telefono' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $telefono = $this->limpiarTelefono($request->telefono);

            // Buscar apoderado con ese número
            $apoderado = Apoderado::where(function($q) use ($telefono) {
                $q->where('telefono_principal', 'LIKE', "%{$telefono}%")
                  ->orWhere('telefono_secundario', 'LIKE', "%{$telefono}%");
            })->with('estudiantes')->first();

            if (!$apoderado) {
                return response()->json([
                    'success' => false,
                    'autorizado' => false,
                    'message' => 'Número no registrado en el sistema',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'autorizado' => true,
                'apoderado' => [
                    'id' => $apoderado->id,
                    'nombre' => $apoderado->nombre_completo,
                    'estudiantes' => $apoderado->estudiantes->map(function($est) {
                        return [
                            'id' => $est->id,
                            'nombre' => $est->nombre_completo,
                            'codigo' => $est->codigo_estudiante,
                        ];
                    }),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al validar usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📅 Obtener horario de estudiante
     *
     * GET /api/v1/chatbot/horario/{estudianteId}
     *
     * @param int $estudianteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHorario(int $estudianteId)
    {
        try {
            $estudiante = Estudiante::with(['matriculas' => function($q) {
                $q->where('estado', 'ACTIVA')->latest();
            }])->findOrFail($estudianteId);

            $matricula = $estudiante->matriculas->first();
            if (!$matricula) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay matrícula activa',
                ], 404);
            }

            $horario = HorarioClase::where('grado', $matricula->grado)
                ->where('seccion', $matricula->seccion)
                ->with(['areaCurricular', 'docente'])
                ->orderBy('dia_semana')
                ->orderBy('hora_inicio')
                ->get()
                ->groupBy('dia_semana');

            $horarioFormateado = $horario->map(function($clases, $dia) {
                return [
                    'dia' => $this->nombreDia($dia),
                    'clases' => $clases->map(function($clase) {
                        return [
                            'hora' => Carbon::parse($clase->hora_inicio)->format('H:i') . ' - ' . Carbon::parse($clase->hora_fin)->format('H:i'),
                            'area' => $clase->areaCurricular->nombre ?? 'Sin área',
                            'docente' => $clase->docente->nombre_completo ?? 'Sin docente',
                            'aula' => $clase->aula ?? 'Por definir',
                        ];
                    })->values(),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'estudiante' => [
                    'nombre' => $estudiante->nombre_completo,
                    'grado' => $matricula->grado,
                    'seccion' => $matricula->seccion,
                ],
                'horario' => $horarioFormateado,
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
     * 📖 Obtener notas de estudiante
     *
     * GET /api/v1/chatbot/notas/{estudianteId}?bimestre=I
     *
     * @param Request $request
     * @param int $estudianteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNotas(Request $request, int $estudianteId)
    {
        try {
            $bimestre = $request->query('bimestre');

            $estudiante = Estudiante::findOrFail($estudianteId);

            $query = Evaluacion::where('estudiante_id', $estudianteId)
                ->with(['areaCurricular', 'competencia'])
                ->active();

            if ($bimestre) {
                $query->where('bimestre', $bimestre);
            }

            $evaluaciones = $query->orderBy('fecha_evaluacion', 'desc')->get();

            $notasPorArea = $evaluaciones->groupBy('area_curricular_id')->map(function($notasArea) {
                return [
                    'area' => $notasArea->first()->areaCurricular->nombre ?? 'Sin área',
                    'promedio' => round($notasArea->avg('calificacion_numerica'), 1),
                    'evaluaciones' => $notasArea->map(function($eval) {
                        return [
                            'competencia' => $eval->competencia->nombre ?? 'Sin competencia',
                            'nota' => $eval->calificacion_numerica,
                            'literal' => $eval->calificacion_literal,
                            'fecha' => $eval->fecha_evaluacion->format('d/m/Y'),
                        ];
                    })->values(),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'estudiante' => $estudiante->nombre_completo,
                'bimestre' => $bimestre ?? 'Todos',
                'promedio_general' => round($evaluaciones->avg('calificacion_numerica'), 1),
                'notas_por_area' => $notasPorArea,
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
     * 📅 Obtener asistencia de estudiante
     *
     * GET /api/v1/chatbot/asistencia/{estudianteId}?mes=1&anio=2025
     *
     * @param Request $request
     * @param int $estudianteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAsistencia(Request $request, int $estudianteId)
    {
        try {
            $mes = $request->query('mes', now()->month);
            $anio = $request->query('anio', now()->year);

            $estudiante = Estudiante::findOrFail($estudianteId);

            $asistencias = Asistencia::where('estudiante_id', $estudianteId)
                ->whereMonth('fecha', $mes)
                ->whereYear('fecha', $anio)
                ->get();

            $resumen = [
                'total_dias' => $asistencias->count(),
                'presentes' => $asistencias->where('estado', 'PRESENTE')->count(),
                'faltas' => $asistencias->where('estado', 'FALTA')->count(),
                'tardanzas' => $asistencias->where('estado', 'TARDANZA')->count(),
                'porcentaje' => $asistencias->count() > 0
                    ? round(($asistencias->where('estado', 'PRESENTE')->count() / $asistencias->count()) * 100, 1)
                    : 0,
            ];

            return response()->json([
                'success' => true,
                'estudiante' => $estudiante->nombre_completo,
                'periodo' => Carbon::create($anio, $mes)->locale('es')->isoFormat('MMMM YYYY'),
                'resumen' => $resumen,
                'ultimas_asistencias' => $asistencias->take(10)->map(function($a) {
                    return [
                        'fecha' => $a->fecha->format('d/m/Y'),
                        'estado' => $a->estado,
                        'hora' => $a->hora_registro?->format('H:i'),
                    ];
                }),
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
     * 💰 Obtener estado de pagos del estudiante
     *
     * GET /api/v1/chatbot/pagos/{estudianteId}
     *
     * @param int $estudianteId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPagos(int $estudianteId)
    {
        try {
            $estudiante = Estudiante::findOrFail($estudianteId);

            $cuentasPorCobrar = CuentaPorCobrar::where('estudiante_id', $estudianteId)
                ->where('estado', '!=', 'PAGADA')
                ->orderBy('fecha_vencimiento')
                ->get();

            $totalDeuda = $cuentasPorCobrar->sum('monto_pendiente');

            return response()->json([
                'success' => true,
                'estudiante' => $estudiante->nombre_completo,
                'total_deuda' => $totalDeuda,
                'cuentas_pendientes' => $cuentasPorCobrar->map(function($cuenta) {
                    return [
                        'concepto' => $cuenta->concepto,
                        'monto' => $cuenta->monto_pendiente,
                        'vencimiento' => $cuenta->fecha_vencimiento->format('d/m/Y'),
                        'estado' => $cuenta->estado,
                        'vencida' => $cuenta->fecha_vencimiento->isPast(),
                    ];
                }),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pagos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 📆 Obtener eventos próximos
     *
     * GET /api/v1/chatbot/eventos
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEventos()
    {
        try {
            // Aquí se pueden obtener eventos de un modelo Evento o Comunicacion
            // Por ahora retorno un placeholder

            return response()->json([
                'success' => true,
                'eventos' => [
                    [
                        'titulo' => 'Reunión de apoderados',
                        'fecha' => now()->addDays(3)->format('d/m/Y'),
                        'hora' => '18:00',
                        'descripcion' => 'Reunión informativa sobre el segundo bimestre',
                    ],
                    [
                        'titulo' => 'Día del logro',
                        'fecha' => now()->addDays(15)->format('d/m/Y'),
                        'hora' => '10:00',
                        'descripcion' => 'Presentación de proyectos de los estudiantes',
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener eventos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // MÉTODOS AUXILIARES
    // ═══════════════════════════════════════════════════════════════

    private function limpiarTelefono(string $telefono): string
    {
        return preg_replace('/[^0-9]/', '', $telefono);
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
