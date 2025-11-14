<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class CodigoQrAsistencia extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'codigos_qr_asistencia';

    protected $fillable = [
        'uuid',
        'codigo',
        'grado',
        'seccion',
        'tipo',
        'fecha_generacion',
        'fecha_expiracion',
        'valido',
        'veces_usado',
        'max_usos',
        'generado_por',
    ];

    protected $casts = [
        'valido' => 'boolean',
        'fecha_generacion' => 'datetime',
        'fecha_expiracion' => 'datetime',
        'veces_usado' => 'integer',
        'max_usos' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function generador()
    {
        return $this->belongsTo(Usuario::class, 'generado_por');
    }

    // Scopes
    public function scopeValidos($query)
    {
        return $query->where('valido', true)
                    ->where('fecha_expiracion', '>', now());
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeBySeccion($query, $seccion)
    {
        return $query->where('seccion', $seccion);
    }

    // Methods
    public function incrementarUso()
    {
        $this->increment('veces_usado');

        if ($this->max_usos && $this->veces_usado >= $this->max_usos) {
            $this->update(['valido' => false]);
        }
    }

    public function estaVigente(): bool
    {
        return $this->valido &&
               $this->fecha_expiracion->isFuture() &&
               (!$this->max_usos || $this->veces_usado < $this->max_usos);
    }
}
