<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class PlantillaComunicacion extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'plantillas_comunicacion';

    protected $fillable = [
        'uuid',
        'nombre',
        'codigo',
        'tipo',
        'asunto',
        'mensaje',
        'variables',
        'activo',
        'es_sistema',
    ];

    protected $casts = [
        'variables' => 'array',
        'activo' => 'boolean',
        'es_sistema' => 'boolean',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopeCustom($query)
    {
        return $query->where('es_sistema', false);
    }

    // Methods
    public function compilar(array $data): string
    {
        $mensaje = $this->mensaje;

        foreach ($this->variables ?? [] as $variable) {
            $placeholder = "{{" . $variable . "}}";
            $value = $data[$variable] ?? '';
            $mensaje = str_replace($placeholder, $value, $mensaje);
        }

        return $mensaje;
    }
}
