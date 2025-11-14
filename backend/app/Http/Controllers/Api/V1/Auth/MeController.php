<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class MeController extends Controller
{
    public function show(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'data' => new UserResource($user)
        ]);
    }
}
