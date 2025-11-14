<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth;
use App\Http\Controllers\Api\V1\Superadmin;
use App\Http\Controllers\Api\V1\Director;
use App\Http\Controllers\Api\V1\Docente;
use App\Http\Controllers\Api\V1\Apoderado;

// ════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS (Sin autenticación)
// ════════════════════════════════════════════════════════════

Route::prefix('v1')->group(function () {

    // Autenticación
    Route::post('/login', [Auth\LoginController::class, 'login']);
    Route::post('/register-tenant', [Auth\RegisterController::class, 'registerTenant']);
    Route::post('/forgot-password', [Auth\PasswordController::class, 'forgot']);

    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now(),
            'version' => config('app.version')
        ]);
    });
});

// ════════════════════════════════════════════════════════════
// RUTAS CON TENANT (Requieren identificación de institución)
// ════════════════════════════════════════════════════════════

Route::prefix('v1')->middleware(['tenant', 'auth:sanctum'])->group(function () {

    // Auth general
    Route::post('/logout', [Auth\LogoutController::class, 'logout']);
    Route::get('/me', [Auth\MeController::class, 'show']);
    Route::put('/profile', [Auth\ProfileController::class, 'update']);

    // ════════════════════════════════════════════════════════
    // RUTAS SUPERADMIN (Gestión de tenants)
    // ════════════════════════════════════════════════════════

    Route::prefix('superadmin')->middleware('role:SUPER_ADMIN')->group(function () {
        Route::get('/dashboard', [Superadmin\DashboardController::class, 'index']);

        // Tenants CRUD
        Route::apiResource('tenants', Superadmin\TenantController::class);
        Route::post('tenants/{id}/activate', [Superadmin\TenantController::class, 'activate']);
        Route::post('tenants/{id}/suspend', [Superadmin\TenantController::class, 'suspend']);

        // Subscriptions
        Route::apiResource('subscriptions', Superadmin\SubscriptionController::class);

        // Analytics globales
        Route::get('/analytics', [Superadmin\AnalyticsController::class, 'index']);
    });

    // ════════════════════════════════════════════════════════
    // RUTAS DIRECTOR (Gestión institucional)
    // ════════════════════════════════════════════════════════

    Route::prefix('director')->middleware('role:DIRECTOR,SUBDIRECTOR')->group(function () {
        Route::get('/dashboard', [Director\DashboardController::class, 'index']);

        // Usuarios
        Route::apiResource('usuarios', Director\UserController::class);
        Route::post('usuarios/import', [Director\UserController::class, 'import']);

        // Matrícula
        Route::apiResource('matriculas', Director\MatriculaController::class);
        Route::post('matriculas/{id}/aprobar', [Director\MatriculaController::class, 'aprobar']);
        Route::post('matriculas/{id}/rechazar', [Director\MatriculaController::class, 'rechazar']);
        Route::get('cupos', [Director\CuposController::class, 'index']);

        // Reportes
        Route::get('reportes/estadisticas', [Director\ReportesController::class, 'estadisticas']);
        Route::post('reportes/generar', [Director\ReportesController::class, 'generar']);
        Route::get('reportes/export-siagie', [Director\ReportesController::class, 'exportSIAGIE']);

        // Configuración
        Route::get('configuracion', [Director\ConfiguracionController::class, 'index']);
        Route::put('configuracion', [Director\ConfiguracionController::class, 'update']);

        // Importación inteligente
        Route::post('import/batch', [Director\ImportController::class, 'createBatch']);
        Route::get('import/batch/{id}', [Director\ImportController::class, 'getBatchStatus']);
        Route::post('import/batch/{id}/process', [Director\ImportController::class, 'processBatch']);
    });

    // ════════════════════════════════════════════════════════
    // RUTAS DOCENTE
    // ════════════════════════════════════════════════════════

    Route::prefix('docente')->middleware('role:DOCENTE')->group(function () {
        Route::get('/dashboard', [Docente\DashboardController::class, 'index']);

        // Mis estudiantes
        Route::get('/mis-estudiantes', [Docente\EstudianteController::class, 'misEstudiantes']);

        // Asistencia
        Route::post('asistencias', [Docente\AsistenciaController::class, 'registrar']);
        Route::post('asistencias/qr-scan', [Docente\AsistenciaController::class, 'registrarPorQR']);
        Route::get('asistencias/hoy', [Docente\AsistenciaController::class, 'hoy']);

        // Evaluaciones
        Route::apiResource('evaluaciones', Docente\EvaluacionController::class);
        Route::post('evaluaciones/masiva', [Docente\EvaluacionController::class, 'registroMasivo']);

        // Tareas
        Route::apiResource('tareas', Docente\TareasController::class);
        Route::get('tareas/{id}/entregas', [Docente\TareasController::class, 'verEntregas']);
        Route::post('entregas/{id}/calificar', [Docente\TareasController::class, 'calificarEntrega']);

        // Comunicaciones
        Route::post('comunicaciones/enviar', [Docente\ComunicacionesController::class, 'enviar']);
        Route::apiResource('reuniones', Docente\ReunionesController::class);
    });

    // ════════════════════════════════════════════════════════
    // RUTAS APODERADO
    // ════════════════════════════════════════════════════════

    Route::prefix('apoderado')->middleware('role:APODERADO')->group(function () {
        Route::get('/dashboard', [Apoderado\DashboardController::class, 'index']);

        // Mis hijos
        Route::get('/estudiantes', [Apoderado\EstudianteController::class, 'index']);
        Route::get('/estudiantes/{id}', [Apoderado\EstudianteController::class, 'show']);

        // Notas
        Route::get('/estudiantes/{id}/notas', [Apoderado\NotasController::class, 'index']);
        Route::get('/estudiantes/{id}/boleta/{periodo}/{bimestre}', [Apoderado\NotasController::class, 'descargarBoleta']);

        // Asistencia
        Route::get('/estudiantes/{id}/asistencia', [Apoderado\AsistenciaController::class, 'index']);

        // Pagos
        Route::get('/pagos/pendientes', [Apoderado\PagosController::class, 'pendientes']);
        Route::post('/pagos/registrar', [Apoderado\PagosController::class, 'registrar']);

        // Comunicaciones
        Route::get('/notificaciones', [Apoderado\NotificacionesController::class, 'index']);
        Route::get('/reuniones', [Apoderado\ReunionesController::class, 'misReuniones']);
    });
});
