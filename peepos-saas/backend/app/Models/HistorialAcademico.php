<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class HistorialAcademico extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'historial_academico';

    protected $fillable = [
        'uuid',
        'estudiante_id',
        'periodo_academico_id',
        'grado',
        'seccion',
        'nivel_educativo',
        'promedio_general',
        'promedio_ponderado',
        'situacion_final',
        'areas_desaprobadas',
        'observaciones',
        'certificado_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'areas_desaprobadas' => 'array',
        'promedio_general' => 'decimal:2',
        'promedio_ponderado' => 'decimal:2',
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

    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    // Scopes
    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeAprobados($query)
    {
        return $query->where('situacion_final', 'APROBADO');
    }

    public function scopeDesaprobados($query)
    {
        return $query->where('situacion_final', 'DESAPROBADO');
    }
}
