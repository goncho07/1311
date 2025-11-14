<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class MovimientoInventario extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'uuid',
        'inventario_item_id',
        'tipo_movimiento',
        'ubicacion_origen',
        'ubicacion_destino',
        'responsable_origen',
        'responsable_destino',
        'fecha_movimiento',
        'motivo',
        'observaciones',
        'documento_respaldo_url',
        'registrado_por',
    ];

    protected $casts = [
        'fecha_movimiento' => 'datetime',
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
    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_movimiento', $tipo);
    }

    public function scopeByItem($query, $itemId)
    {
        return $query->where('inventario_item_id', $itemId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('fecha_movimiento', '>=', now()->subDays($days));
    }
}
