<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para validar roles y permisos
 */
class CheckRolePermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$rolesOrPermissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
                'message' => 'Debe estar autenticado para acceder a este recurso',
            ], 401);
        }

        // Verificar que el usuario está activo
        if (!$user->is_active) {
            return response()->json([
                'error' => 'Usuario inactivo',
                'message' => 'Su cuenta ha sido desactivada. Contacte al administrador.',
            ], 403);
        }

        // Verificar roles o permisos
        foreach ($rolesOrPermissions as $roleOrPermission) {
            // Si comienza con 'permission:' es un permiso
            if (str_starts_with($roleOrPermission, 'permission:')) {
                $permission = str_replace('permission:', '', $roleOrPermission);
                if ($user->hasPermissionTo($permission)) {
                    return $next($request);
                }
            } else {
                // Es un rol
                if ($user->hasRole($roleOrPermission)) {
                    return $next($request);
                }
            }
        }

        // Log de intento de acceso no autorizado
        \Log::warning('Acceso denegado por falta de permisos', [
            'user_id' => $user->id,
            'required_roles_or_permissions' => $rolesOrPermissions,
            'user_roles' => $user->getRoleNames(),
            'user_permissions' => $user->getAllPermissions()->pluck('name'),
            'url' => $request->fullUrl(),
        ]);

        return response()->json([
            'error' => 'Permisos insuficientes',
            'message' => 'No tiene los permisos necesarios para realizar esta acción',
            'required' => $rolesOrPermissions,
        ], 403);
    }
}
