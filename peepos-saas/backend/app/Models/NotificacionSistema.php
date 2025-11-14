<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class NotificacionSistema extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'notificaciones_sistema';

    protected $fillable = [
        'uuid',
        'usuario_id',
        'tipo',
        'titulo',
        'mensaje',
        'icono',
        'url',
        'prioridad',
        'leida',
        'fecha_lectura',
        'accion_realizada',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'leida' => 'boolean',
        'accion_realizada' => 'boolean',
        'fecha_lectura' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    // Scopes
    public function scopeNoLeidas($query)
    {
        return $query->where('leida', false);
    }

    public function scopeLeidas($query)
    {
        return $query->where('leida', true);
    }

    public function scopeByUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
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
            'leida' => true,
            'fecha_lectura' => now(),
        ]);
    }

    public function marcarAccionRealizada()
    {
        $this->update([
            'accion_realizada' => true,
        ]);
    }
}
