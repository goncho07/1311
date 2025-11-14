<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class ConcursoCye extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'concursos_cye';

    protected $fillable = [
        'uuid',
        'nombre',
        'descripcion',
        'tipo',
        'nivel',
        'grados_participantes',
        'fecha_inicio',
        'fecha_fin',
        'lugar',
        'organizador',
        'estado',
        'resultados',
        'archivos',
        'metadata',
    ];

    protected $casts = [
        'grados_participantes' => 'array',
        'resultados' => 'array',
        'archivos' => 'array',
        'metadata' => 'array',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeByNivel($query, $nivel)
    {
        return $query->where('nivel', $nivel);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('fecha_inicio', '>', now());
    }

    public function scopeCurrent($query)
    {
        return $query->whereDate('fecha_inicio', '<=', now())
                    ->whereDate('fecha_fin', '>=', now());
    }
}
