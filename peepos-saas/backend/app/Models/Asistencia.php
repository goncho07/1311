<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Asistencia extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'asistencias';

    protected $fillable = [
        'uuid',
        'estudiante_id',
        'periodo_academico_id',
        'fecha',
        'hora_registro',
        'tipo',
        'estado',
        'justificacion',
        'documento_justificacion_url',
        'observaciones',
        'registrado_por',
        'metodo_registro',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'fecha' => 'date',
        'hora_registro' => 'datetime',
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

    public function registrador()
    {
        return $this->belongsTo(Usuario::class, 'registrado_por');
    }

    // Scopes
    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopePresentes($query)
    {
        return $query->where('estado', 'PRESENTE');
    }

    public function scopeAusentes($query)
    {
        return $query->where('estado', 'AUSENTE');
    }

    public function scopeTardanzas($query)
    {
        return $query->where('estado', 'TARDANZA');
    }
}
