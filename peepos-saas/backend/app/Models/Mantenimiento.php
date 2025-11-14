<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Mantenimiento extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'mantenimientos';

    protected $fillable = [
        'uuid',
        'inventario_item_id',
        'tipo_mantenimiento',
        'descripcion',
        'fecha_programada',
        'fecha_realizada',
        'costo',
        'proveedor',
        'tecnico_responsable',
        'estado',
        'observaciones',
        'documento_respaldo_url',
        'proxima_fecha',
        'registrado_por',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'fecha_realizada' => 'date',
        'proxima_fecha' => 'date',
        'costo' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function item()
    {
        return $this->belongsTo(InventarioItem::class, 'inventario_item_id');
    }

    public function registrador()
    {
        return $this->belongsTo(Usuario::class, 'registrado_por');
    }

    // Scopes
    public function scopeByItem($query, $itemId)
    {
        return $query->where('inventario_item_id', $itemId);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_mantenimiento', $tipo);
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeRealizados($query)
    {
        return $query->where('estado', 'REALIZADO');
    }

    public function scopeProximoVencimiento($query, $days = 30)
    {
        return $query->where('proxima_fecha', '<=', now()->addDays($days))
                    ->where('estado', 'REALIZADO');
    }
}
