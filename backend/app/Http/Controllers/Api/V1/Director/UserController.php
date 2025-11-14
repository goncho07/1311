<?php

namespace App\Http\Controllers\Api\V1\Director;

use App\Http\Controllers\Controller;
use App\Http\Requests\Director\CreateUserRequest;
use App\Http\Requests\Director\UpdateUserRequest;
use App\Http\Requests\Director\ImportUsersRequest;
use App\Http\Resources\UserResource;
use App\Services\Director\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->list($request->all());

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'total' => $users->total(),
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage()
            ]
        ]);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'data' => new UserResource($user)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        return response()->json([
            'data' => new UserResource($user)
        ]);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->update($id, $request->validated());

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'data' => new UserResource($user)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->userService->delete($id);

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }

    public function import(ImportUsersRequest $request): JsonResponse
    {
        $result = $this->userService->importFromFile($request->validated());

        return response()->json([
            'message' => 'Importación procesada exitosamente',
            'data' => $result
        ]);
    }
}
