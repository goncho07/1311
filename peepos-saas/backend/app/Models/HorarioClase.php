<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class HorarioClase extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'horarios_clases';

    protected $fillable = [
        'uuid',
        'asignacion_docente_id',
        'docente_id',
        'grado',
        'seccion',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'aula',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'hora_inicio' => 'datetime',
        'hora_fin' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function asignacionDocente()
    {
        return $this->belongsTo(AsignacionDocente::class);
    }

    public function docente()
    {
        return $this->belongsTo(Docente::class);
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

    public function scopeByDia($query, $dia)
    {
        return $query->where('dia_semana', $dia);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeBySeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    // Accessors
    public function getDuracionMinutosAttribute(): int
    {
        return $this->hora_inicio->diffInMinutes($this->hora_fin);
    }
}
