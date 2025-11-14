<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class InscripcionActividad extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'inscripciones_actividades';

    protected $fillable = [
        'uuid',
        'actividad_extracurricular_id',
        'estudiante_id',
        'fecha_inscripcion',
        'estado',
        'autorizado_por_apoderado',
        'fecha_autorizacion',
        'documento_autorizacion_url',
        'observaciones',
    ];

    protected $casts = [
        'autorizado_por_apoderado' => 'boolean',
        'fecha_inscripcion' => 'date',
        'fecha_autorizacion' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function actividad()
    {
        return $this->belongsTo(ActividadExtracurricular::class, 'actividad_extracurricular_id');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('estado', 'ACTIVA');
    }

    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByActividad($query, $actividadId)
    {
        return $query->where('actividad_extracurricular_id', $actividadId);
    }

    public function scopePendientesAutorizacion($query)
    {
        return $query->where('autorizado_por_apoderado', false);
    }
}
