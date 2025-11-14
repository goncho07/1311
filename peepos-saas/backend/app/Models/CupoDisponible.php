<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class CupoDisponible extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'cupos_disponibles';

    protected $fillable = [
        'uuid',
        'periodo_academico_id',
        'grado',
        'seccion',
        'nivel_educativo',
        'cupos_totales',
        'cupos_ocupados',
        'cupos_reservados',
        'cupos_disponibles',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'cupos_totales' => 'integer',
        'cupos_ocupados' => 'integer',
        'cupos_reservados' => 'integer',
        'cupos_disponibles' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeBySeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    public function scopeConCuposDisponibles($query)
    {
        return $query->where('cupos_disponibles', '>', 0);
    }

    // Methods
    public function ocuparCupo()
    {
        $this->increment('cupos_ocupados');
        $this->decrement('cupos_disponibles');
    }

    public function liberarCupo()
    {
        $this->decrement('cupos_ocupados');
        $this->increment('cupos_disponibles');
    }

    public function reservarCupo()
    {
        $this->increment('cupos_reservados');
        $this->decrement('cupos_disponibles');
    }
}
