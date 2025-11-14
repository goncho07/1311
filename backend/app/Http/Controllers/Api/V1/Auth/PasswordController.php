<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Services\Auth\PasswordService;
use Illuminate\Http\JsonResponse;

class PasswordController extends Controller
{
    protected $passwordService;

    public function __construct(PasswordService $passwordService)
    {
        $this->passwordService = $passwordService;
    }

    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordService->sendResetLink($request->validated());

        return response()->json([
            'message' => 'Enlace de recuperación enviado al correo electrónico'
        ]);
    }
}
