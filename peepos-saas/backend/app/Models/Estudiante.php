<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Estudiante extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'estudiantes';

    protected $fillable = [
        'uuid',
        'codigo_estudiante',
        'usuario_id',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'tipo_documento',
        'numero_documento',
        'fecha_nacimiento',
        'genero',
        'lugar_nacimiento',
        'nacionalidad',
        'lengua_materna',
        'religion',
        'discapacidad',
        'tipo_discapacidad',
        'condicion_salud',
        'grupo_sanguineo',
        'alergias',
        'direccion',
        'distrito',
        'provincia',
        'departamento',
        'telefono_emergencia',
        'foto_perfil',
        'estado',
        'observaciones',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'alergias' => 'array',
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

    public function apoderados()
    {
        return $this->belongsToMany(Apoderado::class, 'estudiante_apoderado', 'estudiante_id', 'apoderado_id')
                    ->using(EstudianteApoderado::class)
                    ->withPivot('tipo_relacion', 'prioridad', 'autorizado_recoger', 'vive_con_estudiante')
                    ->withTimestamps();
    }

    public function matriculas()
    {
        return $this->hasMany(Matricula::class);
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class);
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    public function historialAcademico()
    {
        return $this->hasMany(HistorialAcademico::class);
    }

    public function incidenciasDisciplinarias()
    {
        return $this->hasMany(IncidenciaDisciplinaria::class);
    }

    public function inscripcionesActividades()
    {
        return $this->hasMany(InscripcionActividad::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->whereHas('matriculas', function($q) use ($grado) {
            $q->where('grado', $grado)->where('estado', 'ACTIVA');
        });
    }

    // Accessors
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }

    public function getEdadAttribute(): int
    {
        return $this->fecha_nacimiento->age ?? 0;
    }
}
