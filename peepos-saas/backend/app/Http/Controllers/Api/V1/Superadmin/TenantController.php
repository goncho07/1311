<?php

namespace App\Http\Controllers\Api\V1\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Tenant;
use App\Services\Tenancy\TenantService;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    protected TenantService $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Listar todos los tenants (instituciones)
     */
    public function index(Request $request)
    {
        $tenants = Tenant::with(['subscription', 'users'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('domain', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->paginate($request->per_page ?? 15);

        return response()->json($tenants);
    }

    /**
     * Crear nuevo tenant (institución educativa)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|unique:tenants,domain|max:255',
            'email' => 'required|email|unique:tenants,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'ruc' => 'nullable|string|size:11',
            'director_name' => 'required|string|max:255',
            'director_email' => 'required|email',
            'plan' => 'required|in:basic,standard,premium',
        ]);

        // Crear tenant con su base de datos
        $tenant = $this->tenantService->createTenant($validated);

        return response()->json([
            'message' => 'Institución creada exitosamente',
            'tenant' => $tenant,
        ], 201);
    }

    /**
     * Mostrar detalles de un tenant
     */
    public function show(string $id)
    {
        $tenant = Tenant::with(['subscription', 'users', 'stats'])->findOrFail($id);

        return response()->json($tenant);
    }

    /**
     * Actualizar información del tenant
     */
    public function update(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'status' => 'sometimes|in:active,suspended,cancelled',
            'settings' => 'nullable|array',
        ]);

        $tenant->update($validated);

        return response()->json([
            'message' => 'Institución actualizada exitosamente',
            'tenant' => $tenant,
        ]);
    }

    /**
     * Suspender tenant
     */
    public function suspend(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $this->tenantService->suspendTenant($tenant);

        return response()->json([
            'message' => 'Institución suspendida exitosamente',
        ]);
    }

    /**
     * Reactivar tenant
     */
    public function activate(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $this->tenantService->activateTenant($tenant);

        return response()->json([
            'message' => 'Institución reactivada exitosamente',
        ]);
    }

    /**
     * Eliminar tenant (soft delete)
     */
    public function destroy(string $id)
    {
        $tenant = Tenant::findOrFail($id);

        $this->tenantService->deleteTenant($tenant);

        return response()->json([
            'message' => 'Institución eliminada exitosamente',
        ]);
    }

    /**
     * Estadísticas globales de tenants
     */
    public function stats()
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'active')->count(),
            'suspended_tenants' => Tenant::where('status', 'suspended')->count(),
            'total_users' => \App\Models\User::count(),
            'new_this_month' => Tenant::whereMonth('created_at', now()->month)->count(),
            'revenue_this_month' => Tenant::with('subscription')
                ->get()
                ->sum(fn($t) => $t->subscription->amount ?? 0),
        ];

        return response()->json($stats);
    }
}
