<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Apoderado extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'apoderados';

    protected $fillable = [
        'uuid',
        'codigo_apoderado',
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
        'ocupacion',
        'centro_trabajo',
        'nivel_educativo',
        'estado_civil',
        'foto_perfil',
        'estado',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'fecha_nacimiento' => 'date',
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

    public function estudiantes()
    {
        return $this->belongsToMany(Estudiante::class, 'estudiante_apoderado', 'apoderado_id', 'estudiante_id')
                    ->using(EstudianteApoderado::class)
                    ->withPivot('tipo_relacion', 'prioridad', 'autorizado_recoger', 'vive_con_estudiante')
                    ->withTimestamps();
    }

    public function comunicaciones()
    {
        return $this->hasMany(Comunicacion::class);
    }

    public function reuniones()
    {
        return $this->hasMany(ReunionApoderado::class);
    }

    public function transacciones()
    {
        return $this->hasMany(TransaccionFinanciera::class);
    }

    public function cuentasPorCobrar()
    {
        return $this->hasMany(CuentaPorCobrar::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Accessors
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
