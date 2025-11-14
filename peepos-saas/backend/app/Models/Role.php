<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Role extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'roles';

    protected $fillable = [
        'uuid',
        'nombre',
        'slug',
        'descripcion',
        'nivel_acceso',
        'es_sistema',
        'configuracion',
    ];

    protected $casts = [
        'configuracion' => 'array',
        'es_sistema' => 'boolean',
        'nivel_acceso' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'usuario_roles', 'role_id', 'usuario_id')
                    ->withTimestamps();
    }

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'role_permisos', 'role_id', 'permiso_id')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeSystem($query)
    {
        return $query->where('es_sistema', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('es_sistema', false);
    }

    // Methods
    public function assignPermission($permission)
    {
        return $this->permisos()->attach($permission);
    }

    public function revokePermission($permission)
    {
        return $this->permisos()->detach($permission);
    }

    public function hasPermission($permission): bool
    {
        return $this->permisos()->where('nombre', $permission)->exists();
    }
}
