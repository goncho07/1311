<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class ConfiguracionInstitucional extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'configuraciones_institucionales';

    protected $fillable = [
        'uuid',
        'clave',
        'valor',
        'tipo',
        'categoria',
        'descripcion',
        'es_publica',
        'modificable',
        'metadata',
    ];

    protected $casts = [
        'valor' => 'array',
        'metadata' => 'array',
        'es_publica' => 'boolean',
        'modificable' => 'boolean',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Scopes
    public function scopePublicas($query)
    {
        return $query->where('es_publica', true);
    }

    public function scopeModificables($query)
    {
        return $query->where('modificable', true);
    }

    public function scopeByCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopeByClave($query, $clave)
    {
        return $query->where('clave', $clave);
    }

    // Methods
    public static function obtener($clave, $default = null)
    {
        $config = static::where('clave', $clave)->first();
        return $config ? $config->valor : $default;
    }

    public static function establecer($clave, $valor, $tipo = 'string', $categoria = 'general')
    {
        return static::updateOrCreate(
            ['clave' => $clave],
            [
                'valor' => $valor,
                'tipo' => $tipo,
                'categoria' => $categoria,
            ]
        );
    }

    // Accessors
    public function getValorFormateadoAttribute()
    {
        switch ($this->tipo) {
            case 'boolean':
                return filter_var($this->valor, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $this->valor;
            case 'float':
                return (float) $this->valor;
            case 'array':
            case 'json':
                return is_array($this->valor) ? $this->valor : json_decode($this->valor, true);
            default:
                return $this->valor;
        }
    }
}
