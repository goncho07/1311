<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class AsignacionDocente extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'asignaciones_docentes';

    protected $fillable = [
        'uuid',
        'docente_id',
        'area_curricular_id',
        'periodo_academico_id',
        'grado',
        'seccion',
        'nivel_educativo',
        'horas_asignadas',
        'es_tutor',
        'activo',
        'observaciones',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'es_tutor' => 'boolean',
        'horas_asignadas' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function areaCurricular()
    {
        return $this->belongsTo(AreaCurricular::class);
    }

    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    public function tareas()
    {
        return $this->hasMany(Tarea::class);
    }

    public function horariosClase()
    {
        return $this->hasMany(HorarioClase::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByDocente($query, $docenteId)
    {
        return $query->where('docente_id', $docenteId);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeBySeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    public function scopeTutores($query)
    {
        return $query->where('es_tutor', true);
    }
}
