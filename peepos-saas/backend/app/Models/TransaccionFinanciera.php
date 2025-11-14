<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class TransaccionFinanciera extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'transacciones_financieras';

    protected $fillable = [
        'uuid',
        'numero_transaccion',
        'concepto_pago_id',
        'apoderado_id',
        'estudiante_id',
        'tipo_transaccion',
        'monto',
        'moneda',
        'metodo_pago',
        'fecha_transaccion',
        'fecha_vencimiento',
        'estado',
        'numero_comprobante',
        'observaciones',
        'comprobante_url',
        'procesado_por',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'monto' => 'decimal:2',
        'fecha_transaccion' => 'datetime',
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

    public function procesador()
    {
        return $this->belongsTo(Usuario::class, 'procesado_por');
    }

    // Scopes
    public function scopePagadas($query)
    {
        return $query->where('estado', 'PAGADA');
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeByApoderado($query, $apoderadoId)
    {
        return $query->where('apoderado_id', $apoderadoId);
    }

    public function scopeByEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_id', $estudianteId);
    }

    public function scopeByMetodoPago($query, $metodo)
    {
        return $query->where('metodo_pago', $metodo);
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha_transaccion', [$inicio, $fin]);
    }
}
