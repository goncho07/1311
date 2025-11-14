<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class PrestamoLibro extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'prestamos_libros';

    protected $fillable = [
        'uuid',
        'biblioteca_recurso_id',
        'usuario_id',
        'tipo_usuario',
        'fecha_prestamo',
        'fecha_devolucion_programada',
        'fecha_devolucion_real',
        'estado',
        'dias_retraso',
        'multa',
        'observaciones',
        'autorizado_por',
    ];

    protected $casts = [
        'fecha_prestamo' => 'date',
        'fecha_devolucion_programada' => 'date',
        'fecha_devolucion_real' => 'date',
        'dias_retraso' => 'integer',
        'multa' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function recurso()
    {
        return $this->belongsTo(BibliotecaRecurso::class, 'biblioteca_recurso_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function autorizador()
    {
        return $this->belongsTo(Usuario::class, 'autorizado_por');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeVencidos($query)
    {
        return $query->where('estado', 'ACTIVO')
                    ->where('fecha_devolucion_programada', '<', now());
    }

    public function scopeDevueltos($query)
    {
        return $query->where('estado', 'DEVUELTO');
    }

    public function scopeByUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    // Methods
    public function calcularRetraso()
    {
        if ($this->fecha_devolucion_real) {
            $dias = $this->fecha_devolucion_programada->diffInDays($this->fecha_devolucion_real, false);
            $this->dias_retraso = $dias > 0 ? $dias : 0;
        } elseif (now()->gt($this->fecha_devolucion_programada)) {
            $this->dias_retraso = $this->fecha_devolucion_programada->diffInDays(now());
        }

        $this->save();
    }
}
