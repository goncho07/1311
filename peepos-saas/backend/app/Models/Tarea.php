<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Tarea extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'tareas';

    protected $fillable = [
        'uuid',
        'docente_id',
        'asignacion_docente_id',
        'area_curricular_id',
        'titulo',
        'descripcion',
        'instrucciones',
        'tipo',
        'grado',
        'seccion',
        'fecha_asignacion',
        'fecha_entrega',
        'permite_entrega_tardia',
        'puntos_maximos',
        'peso',
        'archivos_adjuntos',
        'rubrica',
        'estado',
        'metadata',
    ];

    protected $casts = [
        'archivos_adjuntos' => 'array',
        'rubrica' => 'array',
        'metadata' => 'array',
        'permite_entrega_tardia' => 'boolean',
        'fecha_asignacion' => 'datetime',
        'fecha_entrega' => 'datetime',
        'puntos_maximos' => 'decimal:2',
        'peso' => 'decimal:2',
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

    public function asignacionDocente()
    {
        return $this->belongsTo(AsignacionDocente::class);
    }

    public function areaCurricular()
    {
        return $this->belongsTo(AreaCurricular::class);
    }

    public function entregas()
    {
        return $this->hasMany(EntregaTarea::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVA');
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeBySeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    public function scopePendientes($query)
    {
        return $query->where('fecha_entrega', '>', now())
                    ->where('estado', 'ACTIVA');
    }

    public function scopeVencidas($query)
    {
        return $query->where('fecha_entrega', '<', now())
                    ->where('estado', 'ACTIVA');
    }
}
