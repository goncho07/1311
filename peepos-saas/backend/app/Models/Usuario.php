<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Usuario extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'usuarios';

    protected $fillable = [
        'uuid',
        'codigo_usuario',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'tipo_documento',
        'numero_documento',
        'email',
        'password',
        'telefono',
        'celular',
        'fecha_nacimiento',
        'genero',
        'direccion',
        'distrito',
        'provincia',
        'departamento',
        'foto_perfil',
        'tipo_usuario',
        'estado',
        'ultimo_acceso',
        'configuracion',
        'email_verified_at',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'configuracion' => 'array',
        'fecha_nacimiento' => 'date',
        'ultimo_acceso' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'usuario_roles', 'usuario_id', 'role_id')
                    ->withTimestamps();
    }

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'usuario_permisos', 'usuario_id', 'permiso_id')
                    ->withTimestamps();
    }

    public function sesiones()
    {
        return $this->hasMany(Sesion::class);
    }

    public function registrosActividad()
    {
        return $this->hasMany(RegistroActividad::class);
    }

    public function notificaciones()
    {
        return $this->hasMany(NotificacionSistema::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_usuario', $tipo);
    }

    // Accessors
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }

    // Methods
    public function hasRole($role): bool
    {
        return $this->roles()->where('nombre', $role)->exists();
    }

    public function hasPermission($permission): bool
    {
        return $this->permisos()->where('nombre', $permission)->exists() ||
               $this->roles()->whereHas('permisos', function($query) use ($permission) {
                   $query->where('nombre', $permission);
               })->exists();
    }
}
