<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class ReunionApoderado extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'reuniones_apoderados';

    protected $fillable = [
        'uuid',
        'apoderado_id',
        'estudiante_id',
        'docente_id',
        'tipo_reunion',
        'asunto',
        'descripcion',
        'fecha_reunion',
        'hora_inicio',
        'hora_fin',
        'modalidad',
        'ubicacion',
        'link_virtual',
        'estado',
        'asistio',
        'observaciones',
        'acuerdos',
        'proxima_reunion',
    ];

    protected $casts = [
        'acuerdos' => 'array',
        'asistio' => 'boolean',
        'fecha_reunion' => 'date',
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
        'proxima_reunion' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function apoderado()
    {
        return $this->belongsTo(Apoderado::class);
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeRealizadas($query)
    {
        return $query->where('estado', 'REALIZADA');
    }

    public function scopeByApoderado($query, $apoderadoId)
    {
        return $query->where('apoderado_id', $apoderadoId);
    }

    public function scopeByDocente($query, $docenteId)
    {
        return $query->where('docente_id', $docenteId);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('fecha_reunion', '>=', now()->toDateString())
                    ->orderBy('fecha_reunion')
                    ->orderBy('hora_inicio');
    }
}
