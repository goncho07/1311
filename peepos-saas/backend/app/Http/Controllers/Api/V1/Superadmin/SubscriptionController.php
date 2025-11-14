<?php

namespace App\Http\Controllers\Api\V1\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Subscription;
use App\Models\Tenant\Tenant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    /**
     * Listar todas las suscripciones
     */
    public function index(Request $request)
    {
        $subscriptions = Subscription::with('tenant')
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->plan, function ($query, $plan) {
                $query->where('plan', $plan);
            })
            ->paginate($request->per_page ?? 15);

        return response()->json($subscriptions);
    }

    /**
     * Crear nueva suscripción para un tenant
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'plan' => 'required|in:basic,standard,premium,enterprise',
            'billing_cycle' => 'required|in:monthly,yearly',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'max_users' => 'nullable|integer|min:1',
            'max_students' => 'nullable|integer|min:1',
            'max_storage_gb' => 'nullable|integer|min:1',
        ]);

        $subscription = Subscription::create($validated);

        return response()->json([
            'message' => 'Suscripción creada exitosamente',
            'subscription' => $subscription->load('tenant'),
        ], 201);
    }

    /**
     * Actualizar suscripción
     */
    public function update(Request $request, string $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'plan' => 'sometimes|in:basic,standard,premium,enterprise',
            'billing_cycle' => 'sometimes|in:monthly,yearly',
            'amount' => 'sometimes|numeric|min:0',
            'end_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,cancelled,expired,trial',
            'max_users' => 'nullable|integer',
            'max_students' => 'nullable|integer',
            'max_storage_gb' => 'nullable|integer',
        ]);

        $subscription->update($validated);

        return response()->json([
            'message' => 'Suscripción actualizada exitosamente',
            'subscription' => $subscription->load('tenant'),
        ]);
    }

    /**
     * Renovar suscripción
     */
    public function renew(Request $request, string $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'months' => 'required|integer|min:1|max:24',
        ]);

        $subscription->end_date = Carbon::parse($subscription->end_date)
            ->addMonths($validated['months']);
        $subscription->status = 'active';
        $subscription->save();

        return response()->json([
            'message' => "Suscripción renovada por {$validated['months']} meses",
            'subscription' => $subscription,
        ]);
    }

    /**
     * Cancelar suscripción
     */
    public function cancel(string $id)
    {
        $subscription = Subscription::findOrFail($id);
        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Suscripción cancelada',
        ]);
    }

    /**
     * Estadísticas de suscripciones
     */
    public function stats()
    {
        $stats = [
            'total_subscriptions' => Subscription::count(),
            'active' => Subscription::where('status', 'active')->count(),
            'expired' => Subscription::where('status', 'expired')->count(),
            'cancelled' => Subscription::where('status', 'cancelled')->count(),
            'mrr' => Subscription::where('status', 'active')
                ->where('billing_cycle', 'monthly')
                ->sum('amount'),
            'arr' => Subscription::where('status', 'active')
                ->where('billing_cycle', 'yearly')
                ->sum('amount'),
            'by_plan' => Subscription::selectRaw('plan, count(*) as count')
                ->groupBy('plan')
                ->get(),
            'expiring_soon' => Subscription::where('status', 'active')
                ->whereBetween('end_date', [now(), now()->addDays(30)])
                ->count(),
        ];

        return response()->json($stats);
    }
}
