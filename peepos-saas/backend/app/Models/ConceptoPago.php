<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class ConceptoPago extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'conceptos_pago';

    protected $fillable = [
        'uuid',
        'codigo',
        'nombre',
        'descripcion',
        'tipo',
        'categoria',
        'monto',
        'moneda',
        'frecuencia',
        'aplica_a',
        'grados',
        'es_obligatorio',
        'activo',
        'metadata',
    ];

    protected $casts = [
        'grados' => 'array',
        'metadata' => 'array',
        'es_obligatorio' => 'boolean',
        'activo' => 'boolean',
        'monto' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function transacciones()
    {
        return $this->hasMany(TransaccionFinanciera::class);
    }

    public function cuentasPorCobrar()
    {
        return $this->hasMany(CuentaPorCobrar::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeObligatorios($query)
    {
        return $query->where('es_obligatorio', true);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->whereJsonContains('grados', $grado);
    }
}
