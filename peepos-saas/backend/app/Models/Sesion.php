<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Sesion extends Model
{
    use BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'sesiones';

    protected $fillable = [
        'uuid',
        'usuario_id',
        'token',
        'ip_address',
        'user_agent',
        'dispositivo',
        'navegador',
        'sistema_operativo',
        'ubicacion',
        'fecha_inicio',
        'fecha_fin',
        'duracion_minutos',
        'activa',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'activa' => 'boolean',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'duracion_minutos' => 'integer',
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

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activa', true);
    }

    public function scopeByUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    // Methods
    public function cerrarSesion()
    {
        $this->update([
            'activa' => false,
            'fecha_fin' => now(),
            'duracion_minutos' => now()->diffInMinutes($this->fecha_inicio),
        ]);
    }
}
