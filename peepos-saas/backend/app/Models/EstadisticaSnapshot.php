<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class EstadisticaSnapshot extends Model
{
    use BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'estadisticas_snapshots';

    protected $fillable = [
        'uuid',
        'tipo',
        'periodo',
        'fecha_snapshot',
        'datos',
        'metricas',
        'metadata',
    ];

    protected $casts = [
        'datos' => 'array',
        'metricas' => 'array',
        'metadata' => 'array',
        'fecha_snapshot' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    // Scopes
    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeByPeriodo($query, $periodo)
    {
        return $query->where('periodo', $periodo);
    }

    public function scopeRecientes($query, $days = 30)
    {
        return $query->where('fecha_snapshot', '>=', now()->subDays($days));
    }

    public function scopeOrdenadosPorFecha($query)
    {
        return $query->orderBy('fecha_snapshot', 'desc');
    }
}
