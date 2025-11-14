<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Evaluacion extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'evaluaciones';

    protected $fillable = [
        'uuid',
        'estudiante_id',
        'docente_id',
        'asignacion_docente_id',
        'area_curricular_id',
        'competencia_minedu_id',
        'periodo_academico_id',
        'tipo_evaluacion',
        'bimestre',
        'nivel_logro',
        'calificacion_literal',
        'calificacion_numerica',
        'peso',
        'descripcion_logro',
        'recomendaciones',
        'fecha_evaluacion',
        'activo',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'activo' => 'boolean',
        'fecha_evaluacion' => 'date',
        'calificacion_numerica' => 'decimal:2',
        'peso' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function asignacionDocente()
    {
        return $this->belongsTo(AsignacionDocente::class);
    }

    public function areaCurricular()
    {
        return $this->belongsTo(AreaCurricular::class);
    }

    public function competencia()
    {
        return $this->belongsTo(CompetenciaMinedu::class, 'competencia_minedu_id');
    }

    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByBimestre($query, $bimestre)
    {
        return $query->where('bimestre', $bimestre);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_evaluacion', $tipo);
    }
}
