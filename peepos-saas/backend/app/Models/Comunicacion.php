<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Comunicacion extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'comunicaciones';

    protected $fillable = [
        'uuid',
        'apoderado_id',
        'estudiante_id',
        'tipo',
        'asunto',
        'mensaje',
        'prioridad',
        'canal',
        'fecha_envio',
        'fecha_lectura',
        'leido',
        'respuesta',
        'archivos_adjuntos',
        'enviado_por',
        'metadata',
    ];

    protected $casts = [
        'archivos_adjuntos' => 'array',
        'metadata' => 'array',
        'leido' => 'boolean',
        'fecha_envio' => 'datetime',
        'fecha_lectura' => 'datetime',
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

    public function remitente()
    {
        return $this->belongsTo(Usuario::class, 'enviado_por');
    }

    // Scopes
    public function scopeLeidas($query)
    {
        return $query->where('leido', true);
    }

    public function scopeNoLeidas($query)
    {
        return $query->where('leido', false);
    }

    public function scopeByApoderado($query, $apoderadoId)
    {
        return $query->where('apoderado_id', $apoderadoId);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeByPrioridad($query, $prioridad)
    {
        return $query->where('prioridad', $prioridad);
    }

    // Methods
    public function marcarComoLeida()
    {
        $this->update([
            'leido' => true,
            'fecha_lectura' => now(),
        ]);
    }
}
