<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo de Suscripción
 *
 * Gestiona planes de pago y límites de cada institución
 * Vive en BD Central
 */
class Subscription extends Model
{
    use HasFactory;

    protected $connection = 'mysql'; // BD Central

    protected $fillable = [
        'tenant_id',
        'plan',
        'precio_mensual',
        'descuento_porcentaje',
        'fecha_inicio',
        'fecha_fin',
        'auto_renovar',
        'estado',
        'metodo_pago',
        'numero_operacion',
        'limites',
        'uso_actual',
        'observaciones',
    ];

    protected $casts = [
        'precio_mensual' => 'decimal:2',
        'descuento_porcentaje' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'auto_renovar' => 'boolean',
        'limites' => 'array',
        'uso_actual' => 'array',
    ];

    /**
     * Relación con tenant
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Verificar si la suscripción está activa
     */
    public function isActive(): bool
    {
        return $this->estado === 'ACTIVA'
            && $this->fecha_fin
            && $this->fecha_fin->isFuture();
    }

    /**
     * Verificar si está vencida
     */
    public function isExpired(): bool
    {
        return $this->fecha_fin && $this->fecha_fin->isPast();
    }

    /**
     * Días restantes de suscripción
     */
    public function daysRemaining(): int
    {
        if (!$this->fecha_fin) {
            return 0;
        }

        return max(0, now()->diffInDays($this->fecha_fin, false));
    }

    /**
     * Calcular precio con descuento
     */
    public function getPrecioFinalAttribute(): float
    {
        $descuento = $this->precio_mensual * ($this->descuento_porcentaje / 100);
        return $this->precio_mensual - $descuento;
    }

    /**
     * Verificar si está cerca de vencer (7 días)
     */
    public function isNearExpiry(): bool
    {
        return $this->daysRemaining() <= 7 && $this->daysRemaining() > 0;
    }

    /**
     * Obtener límite específico
     */
    public function getLimit(string $key): ?int
    {
        return $this->limites[$key] ?? null;
    }

    /**
     * Obtener uso actual de un recurso
     */
    public function getCurrentUsage(string $key): int
    {
        return $this->uso_actual[$key] ?? 0;
    }

    /**
     * Verificar si ha alcanzado el límite
     */
    public function hasReachedLimit(string $key): bool
    {
        $limit = $this->getLimit($key);
        $usage = $this->getCurrentUsage($key);

        return $limit && $usage >= $limit;
    }
}
