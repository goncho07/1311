<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class CapacidadCompetencia extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'capacidades_competencias';

    protected $fillable = [
        'uuid',
        'competencia_minedu_id',
        'codigo',
        'nombre',
        'descripcion',
        'orden',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function competencia()
    {
        return $this->belongsTo(CompetenciaMinedu::class, 'competencia_minedu_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('activo', true);
    }

    public function scopeByCompetencia($query, $competenciaId)
    {
        return $query->where('competencia_minedu_id', $competenciaId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('orden');
    }
}
