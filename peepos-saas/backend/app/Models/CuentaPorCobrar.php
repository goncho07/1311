<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class CuentaPorCobrar extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'cuentas_por_cobrar';

    protected $fillable = [
        'uuid',
        'numero_cuenta',
        'concepto_pago_id',
        'apoderado_id',
        'estudiante_id',
        'periodo_academico_id',
        'monto_total',
        'monto_pagado',
        'monto_pendiente',
        'moneda',
        'fecha_emision',
        'fecha_vencimiento',
        'estado',
        'observaciones',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'monto_total' => 'decimal:2',
        'monto_pagado' => 'decimal:2',
        'monto_pendiente' => 'decimal:2',
        'fecha_emision' => 'date',
        'fecha_vencimiento' => 'date',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function conceptoPago()
    {
        return $this->belongsTo(ConceptoPago::class);
    }

    public function apoderado()
    {
        return $this->belongsTo(Apoderado::class);
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class);
    }

    public function periodoAcademico()
    {
        return $this->belongsTo(PeriodoAcademico::class);
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopePagadas($query)
    {
        return $query->where('estado', 'PAGADA');
    }

    public function scopeVencidas($query)
    {
        return $query->where('fecha_vencimiento', '<', now())
                    ->where('estado', 'PENDIENTE');
    }

    public function scopeByApoderado($query, $apoderadoId)
    {
        return $query->where('apoderado_id', $apoderadoId);
    }

    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    // Methods
    public function registrarPago($monto)
    {
        $this->monto_pagado += $monto;
        $this->monto_pendiente -= $monto;

        if ($this->monto_pendiente <= 0) {
            $this->estado = 'PAGADA';
        } else {
            $this->estado = 'PARCIAL';
        }

        $this->save();
    }
}
