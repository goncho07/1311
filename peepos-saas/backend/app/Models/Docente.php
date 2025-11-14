<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class Docente extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'docentes';

    protected $fillable = [
        'uuid',
        'codigo_docente',
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
        'especialidad',
        'nivel_educativo',
        'titulo_profesional',
        'registro_profesional',
        'fecha_ingreso',
        'tipo_contrato',
        'jornada_laboral',
        'horas_semanales',
        'estado',
        'foto_perfil',
        'cv_url',
        'certificados',
        'metadata',
    ];

    protected $casts = [
        'certificados' => 'array',
        'metadata' => 'array',
        'fecha_nacimiento' => 'date',
        'fecha_ingreso' => 'date',
        'horas_semanales' => 'integer',
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

    public function asignaciones()
    {
        return $this->hasMany(AsignacionDocente::class);
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    public function tareas()
    {
        return $this->hasMany(Tarea::class);
    }

    public function horariosClase()
    {
        return $this->hasMany(HorarioClase::class);
    }

    public function reuniones()
    {
        return $this->hasMany(ReunionApoderado::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeByEspecialidad($query, $especialidad)
    {
        return $query->where('especialidad', $especialidad);
    }

    // Accessors
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
