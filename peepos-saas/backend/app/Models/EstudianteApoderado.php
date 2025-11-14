<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use App\Traits\BelongsToTenant;

class EstudianteApoderado extends Pivot
{
    use BelongsToTenant;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'estudiante_apoderado';

    protected $fillable = [
        'estudiante_id',
        'apoderado_id',
        'tipo_relacion',
        'prioridad',
        'autorizado_recoger',
        'vive_con_estudiante',
        'observaciones',
    ];

    protected $casts = [
        'autorizado_recoger' => 'boolean',
        'vive_con_estudiante' => 'boolean',
        'prioridad' => 'integer',
    ];

    public $timestamps = true;

    // Relationships
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function apoderado()
    {
        return $this->belongsTo(Apoderado::class);
    }

    // Scopes
    public function scopePrincipal($query)
    {
        return $query->where('prioridad', 1);
    }

    public function scopeAutorizadoRecoger($query)
    {
        return $query->where('autorizado_recoger', true);
    }
}
