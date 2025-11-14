<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class AreaCurricular extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'areas_curriculares';

    protected $fillable = [
        'uuid',
        'codigo',
        'nombre',
        'descripcion',
        'nivel_educativo',
        'grado',
        'horas_semanales',
        'orden',
        'color',
        'icono',
        'activo',
        'configuracion',
    ];

    protected $casts = [
        'configuracion' => 'array',
        'activo' => 'boolean',
        'horas_semanales' => 'integer',
        'orden' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function competencias()
    {
        return $this->hasMany(CompetenciaMinedu::class);
    }

    public function asignaciones()
    {
        return $this->hasMany(AsignacionDocente::class);
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    public function tareas()
    {
        return $this->hasMany(Tarea::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByNivel($query, $nivel)
    {
        return $query->where('nivel_educativo', $nivel);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('orden');
    }
}
