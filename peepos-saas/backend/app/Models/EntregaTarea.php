<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class EntregaTarea extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'entregas_tareas';

    protected $fillable = [
        'uuid',
        'tarea_id',
        'estudiante_id',
        'contenido',
        'archivos_adjuntos',
        'fecha_entrega',
        'entrega_tardia',
        'calificacion',
        'puntos_obtenidos',
        'comentarios_docente',
        'estado',
        'fecha_calificacion',
        'metadata',
    ];

    protected $casts = [
        'archivos_adjuntos' => 'array',
        'metadata' => 'array',
        'entrega_tardia' => 'boolean',
        'fecha_entrega' => 'datetime',
        'fecha_calificacion' => 'datetime',
        'puntos_obtenidos' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function tarea()
    {
        return $this->belongsTo(Tarea::class);
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    // Scopes
    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByTarea($query, $tareaId)
    {
        return $query->where('tarea_id', $tareaId);
    }

    public function scopeCalificadas($query)
    {
        return $query->where('estado', 'CALIFICADA');
    }

    public function scopePendientesCalificacion($query)
    {
        return $query->where('estado', 'ENTREGADA');
    }

    public function scopeTardias($query)
    {
        return $query->where('entrega_tardia', true);
    }
}
