<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class BibliotecaRecurso extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'biblioteca_recursos';

    protected $fillable = [
        'uuid',
        'codigo_recurso',
        'tipo_recurso',
        'titulo',
        'autor',
        'editorial',
        'isbn',
        'anio_publicacion',
        'edicion',
        'idioma',
        'categoria',
        'subcategoria',
        'ubicacion',
        'cantidad_total',
        'cantidad_disponible',
        'cantidad_prestados',
        'estado',
        'descripcion',
        'portada_url',
        'permite_prestamo',
        'dias_prestamo',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'permite_prestamo' => 'boolean',
        'cantidad_total' => 'integer',
        'cantidad_disponible' => 'integer',
        'cantidad_prestados' => 'integer',
        'dias_prestamo' => 'integer',
        'anio_publicacion' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function prestamos()
    {
        return $this->hasMany(PrestamoLibro::class);
    }

    // Scopes
    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_recurso', $tipo);
    }

    public function scopeByCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopeDisponibles($query)
    {
        return $query->where('cantidad_disponible', '>', 0)
                    ->where('estado', 'DISPONIBLE')
                    ->where('permite_prestamo', true);
    }

    // Methods
    public function prestar()
    {
        if ($this->cantidad_disponible > 0) {
            $this->decrement('cantidad_disponible');
            $this->increment('cantidad_prestados');
        }
    }

    public function devolver()
    {
        if ($this->cantidad_prestados > 0) {
            $this->increment('cantidad_disponible');
            $this->decrement('cantidad_prestados');
        }
    }
}
