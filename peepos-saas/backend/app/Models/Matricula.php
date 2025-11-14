<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Matricula extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'matriculas';

    protected $fillable = [
        'uuid',
        'codigo_matricula',
        'estudiante_id',
        'periodo_academico_id',
        'grado',
        'seccion',
        'nivel_educativo',
        'turno',
        'tipo_matricula',
        'fecha_matricula',
        'situacion',
        'observaciones',
        'documentos_completos',
        'requiere_traslado',
        'institucion_procedencia',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'documentos_completos' => 'boolean',
        'requiere_traslado' => 'boolean',
        'fecha_matricula' => 'date',
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

    public function documentos()
    {
        return $this->hasMany(DocumentoMatricula::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('situacion', 'ACTIVA');
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeBySeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    public function scopeByPeriodo($query, $periodoId)
    {
        return $query->where('periodo_academico_id', $periodoId);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_matricula', $tipo);
    }
}
