<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class CompetenciaMinedu extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'competencias_minedu';

    protected $fillable = [
        'uuid',
        'area_curricular_id',
        'codigo',
        'nombre',
        'descripcion',
        'nivel_educativo',
        'grado',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function areaCurricular()
    {
        return $this->belongsTo(AreaCurricular::class);
    }

    public function capacidades()
    {
        return $this->hasMany(CapacidadCompetencia::class);
    }

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByNivel($query, $nivel)
    {
        return $query->where('nivel_educativo', $nivel);
    }

    public function scopeByGrado($query, $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeByArea($query, $areaId)
    {
        return $query->where('area_curricular_id', $areaId);
    }
}
