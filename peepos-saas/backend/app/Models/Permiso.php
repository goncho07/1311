<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Permiso extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'permisos';

    protected $fillable = [
        'uuid',
        'nombre',
        'slug',
        'descripcion',
        'modulo',
        'categoria',
        'es_sistema',
    ];

    protected $casts = [
        'es_sistema' => 'boolean',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permisos', 'permiso_id', 'role_id')
                    ->withTimestamps();
    }

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'usuario_permisos', 'permiso_id', 'usuario_id')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeByModulo($query, $modulo)
    {
        return $query->where('modulo', $modulo);
    }

    public function scopeByCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopeSystem($query)
    {
        return $query->where('es_sistema', true);
    }
}
