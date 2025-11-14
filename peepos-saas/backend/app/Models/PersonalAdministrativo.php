<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class PersonalAdministrativo extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'personal_administrativo';

    protected $fillable = [
        'uuid',
        'codigo_personal',
        'usuario_id',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'tipo_documento',
        'numero_documento',
        'fecha_nacimiento',
        'genero',
        'nacionalidad',
        'email',
        'telefono',
        'celular',
        'direccion',
        'distrito',
        'provincia',
        'departamento',
        'cargo',
        'area',
        'nivel_educativo',
        'fecha_ingreso',
        'tipo_contrato',
        'jornada_laboral',
        'estado',
        'foto_perfil',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'fecha_nacimiento' => 'date',
        'fecha_ingreso' => 'date',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeByCargo($query, $cargo)
    {
        return $query->where('cargo', $cargo);
    }

    public function scopeByArea($query, $area)
    {
        return $query->where('area', $area);
    }

    // Accessors
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
