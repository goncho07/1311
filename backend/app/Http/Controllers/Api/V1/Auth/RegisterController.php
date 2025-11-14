<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterTenantRequest;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    protected $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    public function registerTenant(RegisterTenantRequest $request): JsonResponse
    {
        $result = $this->registrationService->registerTenant($request->validated());

        return response()->json([
            'message' => 'Institución registrada exitosamente',
            'data' => $result
        ], 201);
    }
}
