<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DocenteController;
use App\Http\Controllers\Api\AsistenciaDocenteController;

/**
 * ═══════════════════════════════════════════════════════════
 * RUTAS API - PANEL DOCENTE
 * ═══════════════════════════════════════════════════════════
 * Todas las rutas requieren autenticación con Sanctum
 * Middleware: auth:sanctum, role:docente
 */

Route::middleware(['auth:sanctum', 'role:docente'])->prefix('docente')->group(function () {

    // ════════════════════════════════════════════════════════
    // DASHBOARD Y PERFIL
    // ════════════════════════════════════════════════════════
    Route::get('/dashboard', [DocenteController::class, 'dashboard']);
    Route::get('/perfil', [DocenteController::class, 'getPerfil']);
    Route::post('/perfil', [DocenteController::class, 'actualizarPerfil']);
    Route::get('/horario', [DocenteController::class, 'getHorario']);

    // ════════════════════════════════════════════════════════
    // PEEPOS ATTEND - ASISTENCIA
    // ════════════════════════════════════════════════════════
    Route::prefix('asistencia')->group(function () {
        // Secciones
        Route::get('/secciones', [DocenteController::class, 'getMisSecciones']);

        // Registro de asistencia
        Route::get('/estudiantes/{seccionId}', [AsistenciaDocenteController::class, 'getEstudiantesParaAsistencia']);
        Route::post('/registrar', [AsistenciaDocenteController::class, 'registrarAsistencia']);

        // QR Code
        Route::post('/generar-qr', [AsistenciaDocenteController::class, 'generarQRAsistencia']);

        // Reportes
        Route::get('/reporte', [AsistenciaDocenteController::class, 'getReporteAsistencia']);

        // Justificaciones
        Route::get('/justificaciones', [AsistenciaDocenteController::class, 'getJustificaciones']);
        Route::post('/justificaciones/{justificacionId}/aprobar', [AsistenciaDocenteController::class, 'aprobarJustificacion']);
        Route::post('/justificaciones/{justificacionId}/rechazar', [AsistenciaDocenteController::class, 'rechazarJustificacion']);
    });

    // ════════════════════════════════════════════════════════
    // PEEPOS ACADEMIC - EVALUACIONES (TODO: Implementar controlador)
    // ════════════════════════════════════════════════════════
    Route::prefix('evaluaciones')->group(function () {
        // Áreas y competencias
        // Route::get('/areas', [EvaluacionesDocenteController::class, 'getMisAreas']);
        // Route::get('/areas/{areaId}/competencias', [EvaluacionesDocenteController::class, 'getCompetencias']);

        // Evaluaciones
        // Route::get('/', [EvaluacionesDocenteController::class, 'getMisEvaluaciones']);
        // Route::post('/', [EvaluacionesDocenteController::class, 'crearEvaluacion']);

        // Registro de notas
        // Route::get('/{evaluacionId}/estudiantes', [EvaluacionesDocenteController::class, 'getEstudiantesParaNotas']);
        // Route::post('/{evaluacionId}/notas', [EvaluacionesDocenteController::class, 'registrarNotas']);

        // Libro de calificaciones
        // Route::get('/libro', [EvaluacionesDocenteController::class, 'getLibroCalificaciones']);

        // Boletas
        // Route::get('/boletas', [EvaluacionesDocenteController::class, 'getBoletasGeneradas']);
        // Route::post('/boletas/generar', [EvaluacionesDocenteController::class, 'generarBoletas']);
    });

    // ════════════════════════════════════════════════════════
    // TAREAS ACADÉMICAS (TODO: Implementar controlador)
    // ════════════════════════════════════════════════════════
    Route::prefix('tareas')->group(function () {
        // CRUD de tareas
        // Route::get('/', [TareasDocenteController::class, 'index']);
        // Route::post('/', [TareasDocenteController::class, 'store']);
        // Route::put('/{tareaId}', [TareasDocenteController::class, 'update']);
        // Route::delete('/{tareaId}', [TareasDocenteController::class, 'destroy']);

        // Entregas
        // Route::get('/{tareaId}/entregas', [TareasDocenteController::class, 'getEntregas']);
        // Route::post('/entregas/{entregaId}/calificar', [TareasDocenteController::class, 'calificarEntrega']);
    });

    // ════════════════════════════════════════════════════════
    // PEEPOS TUTOR - TUTORÍA (TODO: Implementar controlador)
    // ════════════════════════════════════════════════════════
    Route::prefix('tutoria')->group(function () {
        // Plan de tutoría
        // Route::get('/plan', [TutoriaDocenteController::class, 'getPlan']);
        // Route::post('/plan', [TutoriaDocenteController::class, 'guardarPlan']);

        // Sesiones
        // Route::get('/sesiones', [TutoriaDocenteController::class, 'getSesiones']);
        // Route::post('/sesiones', [TutoriaDocenteController::class, 'registrarSesion']);

        // Casos individuales
        // Route::get('/casos', [TutoriaDocenteController::class, 'getCasos']);
        // Route::post('/casos', [TutoriaDocenteController::class, 'crearCaso']);
        // Route::put('/casos/{casoId}', [TutoriaDocenteController::class, 'actualizarCaso']);
        // Route::post('/casos/{casoId}/derivar', [TutoriaDocenteController::class, 'derivarCaso']);
    });

    // ════════════════════════════════════════════════════════
    // COMUNICACIONES (TODO: Implementar controlador)
    // ════════════════════════════════════════════════════════
    Route::prefix('comunicaciones')->group(function () {
        // Enviar comunicados
        // Route::post('/enviar', [ComunicacionesDocenteController::class, 'enviarComunicado']);
        // Route::get('/historial', [ComunicacionesDocenteController::class, 'getHistorial']);

        // Reuniones
        // Route::get('/reuniones', [ComunicacionesDocenteController::class, 'getReuniones']);
        // Route::post('/reuniones', [ComunicacionesDocenteController::class, 'programarReunion']);
    });

    // ════════════════════════════════════════════════════════
    // PLANIFICACIÓN CURRICULAR (TODO: Implementar controlador)
    // ════════════════════════════════════════════════════════
    Route::prefix('planificacion')->group(function () {
        // Sesiones de aprendizaje
        // Route::get('/sesiones', [PlanificacionDocenteController::class, 'getSesiones']);
        // Route::post('/sesiones', [PlanificacionDocenteController::class, 'guardarSesion']);
        // Route::get('/calendario', [PlanificacionDocenteController::class, 'getCalendario']);
    });
});
