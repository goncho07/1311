<?php

namespace App\Traits;

use App\Models\Tenant\Tenant;
use Illuminate\Database\Eloquent\Builder;

/**
 * Trait CRÍTICO para prevenir data leakage
 * Debe usarse en TODOS los modelos que pertenecen a un tenant
 */
trait BelongsToTenant
{
    /**
     * Boot del trait
     */
    protected static function bootBelongsToTenant(): void
    {
        // Aplicar scope global automáticamente
        static::addGlobalScope('tenant', function (Builder $builder) {
            if ($tenantId = static::getCurrentTenantId()) {
                $builder->where('tenant_id', $tenantId);
            }
        });

        // Auto-asignar tenant_id al crear
        static::creating(function ($model) {
            if (!$model->tenant_id && $tenantId = static::getCurrentTenantId()) {
                $model->tenant_id = $tenantId;
            }
        });
    }

    /**
     * Relación con tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Obtener tenant_id actual del contexto
     */
    protected static function getCurrentTenantId(): ?string
    {
        // Intentar desde request
        if (request()->attributes->has('tenant')) {
            return request()->attributes->get('tenant')->id;
        }

        // Intentar desde usuario autenticado
        if (auth()->check() && auth()->user()->tenant_id) {
            return auth()->user()->tenant_id;
        }

        return null;
    }

    /**
     * Scope para acceder sin filtro de tenant (solo superadmin)
     */
    public function scopeWithoutTenantScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }
}
