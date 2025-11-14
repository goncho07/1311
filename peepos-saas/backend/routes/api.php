<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Superadmin\TenantController;
use App\Http\Controllers\Api\V1\Superadmin\SubscriptionController;
use App\Http\Controllers\Api\V1\Superadmin\DashboardController as SuperadminDashboard;
use App\Http\Controllers\Api\V1\Director\DashboardController as DirectorDashboard;
use App\Http\Controllers\Api\V1\Director\UserController;
use App\Http\Controllers\Api\V1\Chatbot\ChatbotController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check (sin autenticación)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => 'peepos-backend',
    ]);
});

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Rutas de autenticación (sin middleware)
    Route::prefix('auth')->group(function () {
        Route::post('/login', [LoginController::class, 'login']);
        Route::post('/register', [RegisterController::class, 'register']);
        Route::post('/check-email', [RegisterController::class, 'checkEmail']);

        // Rutas autenticadas
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [LoginController::class, 'me']);
            Route::post('/logout', [LogoutController::class, 'logout']);
            Route::post('/logout-all', [LogoutController::class, 'logoutAll']);
            Route::get('/sessions', [LogoutController::class, 'sessions']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Chatbot Routes (para N8N) - Con tenant pero sin auth
    |--------------------------------------------------------------------------
    */
    Route::prefix('chatbot')->middleware(['tenant.identify'])->group(function () {
        Route::post('/validate-user', [ChatbotController::class, 'validateUser']);
        Route::get('/horario/{estudianteId}', [ChatbotController::class, 'getHorario']);
        Route::get('/notas/{estudianteId}', [ChatbotController::class, 'getNotas']);
        Route::get('/asistencia/{estudianteId}', [ChatbotController::class, 'getAsistencia']);
        Route::get('/pagos/{estudianteId}', [ChatbotController::class, 'getPagos']);
        Route::get('/eventos', [ChatbotController::class, 'getEventos']);
    });

    // Rutas protegidas con autenticación
    Route::middleware(['auth:sanctum'])->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Superadmin Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('superadmin')->middleware('role:superadmin')->group(function () {
            Route::get('/dashboard', [SuperadminDashboard::class, 'index']);

            // Gestión de tenants
            Route::apiResource('tenants', TenantController::class);
            Route::post('/tenants/{id}/suspend', [TenantController::class, 'suspend']);
            Route::post('/tenants/{id}/activate', [TenantController::class, 'activate']);
            Route::get('/tenants/stats/overview', [TenantController::class, 'stats']);

            // Gestión de suscripciones
            Route::apiResource('subscriptions', SubscriptionController::class);
            Route::post('/subscriptions/{id}/renew', [SubscriptionController::class, 'renew']);
            Route::post('/subscriptions/{id}/cancel', [SubscriptionController::class, 'cancel']);
            Route::get('/subscriptions/stats/overview', [SubscriptionController::class, 'stats']);
        });

        /*
        |--------------------------------------------------------------------------
        | Director Routes (con validación de tenant)
        |--------------------------------------------------------------------------
        */
        Route::prefix('director')->middleware([
            'tenant.identify',
            'tenant.active',
            'validate.ownership',
            'role:director'
        ])->group(function () {
            Route::get('/dashboard', [DirectorDashboard::class, 'index']);

            // Gestión de usuarios
            Route::apiResource('users', UserController::class);
            Route::post('/users/{id}/deactivate', [UserController::class, 'deactivate']);
            Route::post('/users/{id}/activate', [UserController::class, 'activate']);

            // TODO: Agregar más rutas de director
            // - Estudiantes
            // - Docentes
            // - Matrículas
            // - Reportes
        });

        /*
        |--------------------------------------------------------------------------
        | Docente Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('docente')->middleware([
            'tenant.identify',
            'tenant.active',
            'validate.ownership',
            'role:docente'
        ])->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\V1\Docente\DashboardController::class, 'index']);
            // Asistencia, Evaluaciones y Tareas se agregarán en fases posteriores
        });

        /*
        |--------------------------------------------------------------------------
        | Apoderado Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('apoderado')->middleware([
            'tenant.identify',
            'tenant.active',
            'validate.ownership',
            'role:apoderado'
        ])->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\V1\Apoderado\DashboardController::class, 'index']);
        });

        /*
        |--------------------------------------------------------------------------
        | Estudiante Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('estudiante')->middleware([
            'tenant.identify',
            'tenant.active',
            'validate.ownership',
            'role:estudiante'
        ])->group(function () {
            // Dashboard
            Route::get('/dashboard', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getMiDashboard']);

            // Notas y Evaluaciones
            Route::get('/notas', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getMisNotas']);
            Route::get('/evaluaciones/proximas', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getProximasEvaluaciones']);

            // Tareas
            Route::get('/tareas', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getMisTareas']);
            Route::get('/tareas/{tareaId}', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getTareaDetalle']);
            Route::post('/tareas/{tareaId}/entregar', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'entregarTarea']);

            // Horario
            Route::get('/horario', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getMiHorario']);

            // Asistencia
            Route::get('/asistencia', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getMiAsistencia']);

            // Perfil
            Route::get('/perfil', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'getMiPerfil']);
            Route::post('/perfil', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'actualizarPerfil']);

            // Boleta
            Route::get('/boleta/descargar', [\App\Http\Controllers\Api\V1\Estudiante\EstudianteController::class, 'descargarBoleta']);
        });
    });
});
