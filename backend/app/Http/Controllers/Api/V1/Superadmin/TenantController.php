<?php

namespace App\Http\Controllers\Api\V1\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\CreateTenantRequest;
use App\Http\Requests\Superadmin\UpdateTenantRequest;
use App\Http\Resources\TenantResource;
use App\Services\Superadmin\TenantService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    public function index(Request $request): JsonResponse
    {
        $tenants = $this->tenantService->list($request->all());

        return response()->json([
            'data' => TenantResource::collection($tenants),
            'meta' => [
                'total' => $tenants->total(),
                'current_page' => $tenants->currentPage(),
                'per_page' => $tenants->perPage()
            ]
        ]);
    }

    public function store(CreateTenantRequest $request): JsonResponse
    {
        $tenant = $this->tenantService->create($request->validated());

        return response()->json([
            'message' => 'Tenant creado exitosamente',
            'data' => new TenantResource($tenant)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tenant = $this->tenantService->findById($id);

        return response()->json([
            'data' => new TenantResource($tenant)
        ]);
    }

    public function update(UpdateTenantRequest $request, int $id): JsonResponse
    {
        $tenant = $this->tenantService->update($id, $request->validated());

        return response()->json([
            'message' => 'Tenant actualizado exitosamente',
            'data' => new TenantResource($tenant)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->tenantService->delete($id);

        return response()->json([
            'message' => 'Tenant eliminado exitosamente'
        ]);
    }

    public function activate(int $id): JsonResponse
    {
        $tenant = $this->tenantService->activate($id);

        return response()->json([
            'message' => 'Tenant activado exitosamente',
            'data' => new TenantResource($tenant)
        ]);
    }

    public function suspend(int $id): JsonResponse
    {
        $tenant = $this->tenantService->suspend($id);

        return response()->json([
            'message' => 'Tenant suspendido exitosamente',
            'data' => new TenantResource($tenant)
        ]);
    }
}
