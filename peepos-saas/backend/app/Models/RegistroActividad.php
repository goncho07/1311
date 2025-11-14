<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class RegistroActividad extends Model
{
    use BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'registros_actividad';

    protected $fillable = [
        'uuid',
        'usuario_id',
        'tipo_actividad',
        'modulo',
        'accion',
        'descripcion',
        'entidad_tipo',
        'entidad_id',
        'datos_anteriores',
        'datos_nuevos',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
        'metadata' => 'array',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    // Relationships
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function entidad()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeByUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    public function scopeByModulo($query, $modulo)
    {
        return $query->where('modulo', $modulo);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_actividad', $tipo);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
