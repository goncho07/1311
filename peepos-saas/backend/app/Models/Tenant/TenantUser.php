<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TenantUser extends Model
{
    use SoftDeletes;

    protected $connection = 'central'; // 🔴 Siempre usa BD central

    protected $table = 'tenant_users';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'role',
        'estado',
        'ultimo_acceso',
        'preferencias',
    ];

    protected $casts = [
        'preferencias' => 'array',
        'ultimo_acceso' => 'datetime',
    ];

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }
}
