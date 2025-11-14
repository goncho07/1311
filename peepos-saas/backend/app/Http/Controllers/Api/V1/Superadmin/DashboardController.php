<?php

namespace App\Http\Controllers\Api\V1\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Tenant;
use App\Models\Tenant\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard principal del superadministrador
     */
    public function index()
    {
        return response()->json([
            'overview' => $this->getOverview(),
            'revenue' => $this->getRevenue(),
            'tenants_growth' => $this->getTenantsGrowth(),
            'recent_tenants' => $this->getRecentTenants(),
            'subscriptions_expiring' => $this->getExpiringSubscriptions(),
            'system_health' => $this->getSystemHealth(),
        ]);
    }

    /**
     * Vista general de métricas clave
     */
    private function getOverview()
    {
        $now = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();

        return [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'active')->count(),
            'total_users' => DB::table('users')->count(),
            'mrr' => Subscription::where('status', 'active')
                ->where('billing_cycle', 'monthly')
                ->sum('amount'),
            'new_tenants_this_month' => Tenant::whereBetween('created_at', [
                $now->startOfMonth(),
                $now->endOfMonth()
            ])->count(),
            'churn_rate' => $this->calculateChurnRate(),
        ];
    }

    /**
     * Ingresos por mes
     */
    private function getRevenue()
    {
        $last6Months = collect();

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);

            $revenue = Subscription::where('status', 'active')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('amount');

            $last6Months->push([
                'month' => $date->format('M Y'),
                'revenue' => $revenue,
            ]);
        }

        return $last6Months;
    }

    /**
     * Crecimiento de tenants
     */
    private function getTenantsGrowth()
    {
        $last12Months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);

            $count = Tenant::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $last12Months->push([
                'month' => $date->format('M Y'),
                'count' => $count,
            ]);
        }

        return $last12Months;
    }

    /**
     * Tenants recientes
     */
    private function getRecentTenants()
    {
        return Tenant::with('subscription')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'domain' => $tenant->domain,
                    'plan' => $tenant->subscription->plan ?? 'N/A',
                    'status' => $tenant->status,
                    'created_at' => $tenant->created_at,
                ];
            });
    }

    /**
     * Suscripciones próximas a vencer
     */
    private function getExpiringSubscriptions()
    {
        return Subscription::with('tenant')
            ->where('status', 'active')
            ->whereBetween('end_date', [
                Carbon::now(),
                Carbon::now()->addDays(30)
            ])
            ->orderBy('end_date')
            ->take(10)
            ->get()
            ->map(function ($subscription) {
                return [
                    'tenant_name' => $subscription->tenant->name,
                    'plan' => $subscription->plan,
                    'end_date' => $subscription->end_date,
                    'days_remaining' => Carbon::now()->diffInDays($subscription->end_date),
                ];
            });
    }

    /**
     * Estado de salud del sistema
     */
    private function getSystemHealth()
    {
        return [
            'database' => $this->checkDatabaseHealth(),
            'redis' => $this->checkRedisHealth(),
            'storage' => $this->checkStorageHealth(),
            'queue' => $this->checkQueueHealth(),
        ];
    }

    /**
     * Calcular tasa de abandono (churn rate)
     */
    private function calculateChurnRate()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $tenantsAtStart = Tenant::where('created_at', '<', $startOfMonth)->count();
        $cancelledThisMonth = Subscription::where('status', 'cancelled')
            ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
            ->count();

        return $tenantsAtStart > 0
            ? round(($cancelledThisMonth / $tenantsAtStart) * 100, 2)
            : 0;
    }

    private function checkDatabaseHealth()
    {
        try {
            DB::select('SELECT 1');
            return ['status' => 'healthy', 'message' => 'Database connection OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkRedisHealth()
    {
        try {
            \Illuminate\Support\Facades\Redis::ping();
            return ['status' => 'healthy', 'message' => 'Redis connection OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkStorageHealth()
    {
        try {
            $diskSpace = disk_free_space(storage_path());
            $totalSpace = disk_total_space(storage_path());
            $usedPercentage = round((($totalSpace - $diskSpace) / $totalSpace) * 100, 2);

            return [
                'status' => $usedPercentage < 90 ? 'healthy' : 'warning',
                'used_percentage' => $usedPercentage,
                'free_space_gb' => round($diskSpace / 1024 / 1024 / 1024, 2),
            ];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function checkQueueHealth()
    {
        try {
            $failedJobs = DB::table('failed_jobs')->count();
            return [
                'status' => $failedJobs < 10 ? 'healthy' : 'warning',
                'failed_jobs' => $failedJobs,
            ];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
