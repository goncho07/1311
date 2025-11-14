<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Listar usuarios de la institución
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->with('roles')
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    /**
     * Crear nuevo usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:coordinador,docente,secretaria',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'tenant_id' => $request->user()->tenant_id,
            'phone' => $validated['phone'] ?? null,
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user->load('roles'),
        ], 201);
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, string $id)
    {
        $user = User::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Desactivar usuario
     */
    public function deactivate(string $id, Request $request)
    {
        $user = User::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $user->update(['is_active' => false]);

        return response()->json([
            'message' => 'Usuario desactivado exitosamente',
        ]);
    }

    /**
     * Activar usuario
     */
    public function activate(string $id, Request $request)
    {
        $user = User::where('tenant_id', $request->user()->tenant_id)
            ->findOrFail($id);

        $user->update(['is_active' => true]);

        return response()->json([
            'message' => 'Usuario activado exitosamente',
        ]);
    }
}
