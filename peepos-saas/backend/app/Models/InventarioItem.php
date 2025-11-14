<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class InventarioItem extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'inventario_items';

    protected $fillable = [
        'uuid',
        'codigo_item',
        'nombre',
        'descripcion',
        'categoria',
        'subcategoria',
        'marca',
        'modelo',
        'serie',
        'ubicacion',
        'responsable',
        'estado',
        'condicion',
        'fecha_adquisicion',
        'valor_adquisicion',
        'proveedor',
        'garantia_hasta',
        'requiere_mantenimiento',
        'frecuencia_mantenimiento',
        'observaciones',
        'fotos',
        'metadata',
    ];

    protected $casts = [
        'fotos' => 'array',
        'metadata' => 'array',
        'requiere_mantenimiento' => 'boolean',
        'fecha_adquisicion' => 'date',
        'garantia_hasta' => 'date',
        'valor_adquisicion' => 'decimal:2',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function movimientos()
    {
        return $this->hasMany(MovimientoInventario::class);
    }

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class);
    }

    public function responsableUsuario()
    {
        return $this->belongsTo(Usuario::class, 'responsable');
    }

    // Scopes
    public function scopeByCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopeByCondicion($query, $condicion)
    {
        return $query->where('condicion', $condicion);
    }

    public function scopeRequiereMantenimiento($query)
    {
        return $query->where('requiere_mantenimiento', true);
    }

    // Accessors
    public function getEnGarantiaAttribute(): bool
    {
        return $this->garantia_hasta && $this->garantia_hasta->isFuture();
    }
}
