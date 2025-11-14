<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Autenticar usuario y generar token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'tenant_id' => 'nullable|string',
        ]);

        // Intentar autenticación
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $user = Auth::user();

        // Validar que el usuario pertenece al tenant
        if ($request->has('tenant_id') && $user->tenant_id !== $request->tenant_id) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['No tienes acceso a esta institución.'],
            ]);
        }

        // Verificar que el usuario está activo
        if (!$user->is_active) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['Tu cuenta está desactivada. Contacta al administrador.'],
            ]);
        }

        // Generar token con Sanctum
        $token = $user->createToken('api-token', [
            'role:' . $user->role,
            'tenant:' . $user->tenant_id
        ])->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant_id' => $user->tenant_id,
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ], 200);
    }

    /**
     * Cerrar sesión y revocar token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revocar el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente',
        ], 200);
    }

    /**
     * Obtener información del usuario autenticado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant_id' => $user->tenant_id,
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'created_at' => $user->created_at,
            ],
        ], 200);
    }
}
