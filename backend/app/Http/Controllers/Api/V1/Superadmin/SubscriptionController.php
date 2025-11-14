<?php

namespace App\Http\Controllers\Api\V1\Superadmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\CreateSubscriptionRequest;
use App\Http\Requests\Superadmin\UpdateSubscriptionRequest;
use App\Http\Resources\SubscriptionResource;
use App\Services\Superadmin\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    public function index(Request $request): JsonResponse
    {
        $subscriptions = $this->subscriptionService->list($request->all());

        return response()->json([
            'data' => SubscriptionResource::collection($subscriptions),
            'meta' => [
                'total' => $subscriptions->total(),
                'current_page' => $subscriptions->currentPage(),
                'per_page' => $subscriptions->perPage()
            ]
        ]);
    }

    public function store(CreateSubscriptionRequest $request): JsonResponse
    {
        $subscription = $this->subscriptionService->create($request->validated());

        return response()->json([
            'message' => 'Suscripción creada exitosamente',
            'data' => new SubscriptionResource($subscription)
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $subscription = $this->subscriptionService->findById($id);

        return response()->json([
            'data' => new SubscriptionResource($subscription)
        ]);
    }

    public function update(UpdateSubscriptionRequest $request, int $id): JsonResponse
    {
        $subscription = $this->subscriptionService->update($id, $request->validated());

        return response()->json([
            'message' => 'Suscripción actualizada exitosamente',
            'data' => new SubscriptionResource($subscription)
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->subscriptionService->delete($id);

        return response()->json([
            'message' => 'Suscripción eliminada exitosamente'
        ]);
    }
}
