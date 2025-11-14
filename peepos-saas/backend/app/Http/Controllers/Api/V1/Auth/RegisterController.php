<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Registrar nuevo usuario
     * NOTA: Solo para superadmin o durante onboarding de tenant
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols()],
            'role' => 'required|string|in:superadmin,director,coordinador,docente,apoderado',
            'tenant_id' => 'required|string|exists:tenants,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'tenant_id' => $validated['tenant_id'],
            'is_active' => true,
        ]);

        // Asignar rol usando Spatie
        $user->assignRole($validated['role']);

        // Generar token
        $token = $user->createToken('api-token', [
            'role:' . $user->role,
            'tenant:' . $user->tenant_id
        ])->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant_id' => $user->tenant_id,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Verificar disponibilidad de email
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists
                ? 'El email ya está registrado'
                : 'El email está disponible',
        ], 200);
    }
}
