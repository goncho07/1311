<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class PeriodoAcademico extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'periodos_academicos';

    protected $fillable = [
        'uuid',
        'nombre',
        'anio',
        'tipo',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'configuracion',
    ];

    protected $casts = [
        'configuracion' => 'array',
        'activo' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'anio' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function matriculas()
    {
        return $this->hasMany(Matricula::class);
    }

    public function asignaciones()
    {
        return $this->hasMany(AsignacionDocente::class);
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByAnio($query, $anio)
    {
        return $query->where('anio', $anio);
    }

    public function scopeCurrent($query)
    {
        return $query->where('activo', true)
                    ->whereDate('fecha_inicio', '<=', now())
                    ->whereDate('fecha_fin', '>=', now());
    }
}
