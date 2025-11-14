<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class WhatsAppBotConfig extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'whatsapp_bot_config';

    protected $fillable = [
        'uuid',
        'nivel_educativo',
        'session_name',
        'numero_whatsapp',
        'nombre_bot',
        'estado',
        'ultima_conexion',
        'qr_code_path',
        'qr_generado_at',
        'configuracion',
        'estadisticas',
        'notas',
        'activo',
    ];

    protected $casts = [
        'configuracion' => 'array',
        'estadisticas' => 'array',
        'activo' => 'boolean',
        'ultima_conexion' => 'datetime',
        'qr_generado_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true)
                     ->where('estado', 'ACTIVO');
    }

    public function scopeByNivel($query, $nivel)
    {
        return $query->where('nivel_educativo', $nivel);
    }

    // Métodos auxiliares
    public function estaConectado(): bool
    {
        return $this->estado === 'ACTIVO' && $this->ultima_conexion?->isAfter(now()->subMinutes(5));
    }

    public function incrementarMensajesEnviados(): void
    {
        $stats = $this->estadisticas ?? [];
        $stats['mensajes_enviados'] = ($stats['mensajes_enviados'] ?? 0) + 1;
        $stats['ultimo_envio'] = now()->toDateTimeString();
        $this->update(['estadisticas' => $stats]);
    }
}
