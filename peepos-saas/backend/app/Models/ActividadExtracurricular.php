<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class ActividadExtracurricular extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'actividades_extracurriculares';

    protected $fillable = [
        'uuid',
        'nombre',
        'descripcion',
        'tipo',
        'categoria',
        'responsable_id',
        'grados_permitidos',
        'fecha_inicio',
        'fecha_fin',
        'horario',
        'dias_semana',
        'ubicacion',
        'cupos_totales',
        'cupos_disponibles',
        'costo',
        'requiere_autorizacion',
        'estado',
        'imagen_url',
        'metadata',
    ];

    protected $casts = [
        'grados_permitidos' => 'array',
        'dias_semana' => 'array',
        'metadata' => 'array',
        'requiere_autorizacion' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'cupos_totales' => 'integer',
        'cupos_disponibles' => 'integer',
        'costo' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function responsable()
    {
        return $this->belongsTo(Usuario::class, 'responsable_id');
    }

    public function inscripciones()
    {
        return $this->hasMany(InscripcionActividad::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVA');
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeConCupos($query)
    {
        return $query->where('cupos_disponibles', '>', 0);
    }

    public function scopeVigentes($query)
    {
        return $query->where('fecha_inicio', '<=', now())
                    ->where('fecha_fin', '>=', now())
                    ->where('estado', 'ACTIVA');
    }

    // Methods
    public function inscribirEstudiante()
    {
        if ($this->cupos_disponibles > 0) {
            $this->decrement('cupos_disponibles');
        }
    }

    public function desinscribirEstudiante()
    {
        if ($this->cupos_disponibles < $this->cupos_totales) {
            $this->increment('cupos_disponibles');
        }
    }
}
