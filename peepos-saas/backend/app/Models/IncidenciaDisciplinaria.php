<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class IncidenciaDisciplinaria extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'incidencias_disciplinarias';

    protected $fillable = [
        'uuid',
        'estudiante_id',
        'reportado_por',
        'tipo_incidencia',
        'gravedad',
        'fecha_incidencia',
        'hora_incidencia',
        'lugar',
        'descripcion',
        'testigos',
        'medidas_aplicadas',
        'sancion',
        'fecha_sancion',
        'apoderado_notificado',
        'fecha_notificacion',
        'observaciones',
        'archivos_adjuntos',
        'estado',
    ];

    protected $casts = [
        'testigos' => 'array',
        'medidas_aplicadas' => 'array',
        'archivos_adjuntos' => 'array',
        'apoderado_notificado' => 'boolean',
        'fecha_incidencia' => 'date',
        'hora_incidencia' => 'datetime',
        'fecha_sancion' => 'date',
        'fecha_notificacion' => 'datetime',
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

    public function reportante()
    {
        return $this->belongsTo(Usuario::class, 'reportado_por');
    }

    // Scopes
    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByGravedad($query, $gravedad)
    {
        return $query->where('gravedad', $gravedad);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_incidencia', $tipo);
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeResueltas($query)
    {
        return $query->where('estado', 'RESUELTA');
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('fecha_incidencia', '>=', now()->subDays($days));
    }
}
