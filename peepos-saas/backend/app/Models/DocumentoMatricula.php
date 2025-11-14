<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class DocumentoMatricula extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'documentos_matricula';

    protected $fillable = [
        'uuid',
        'matricula_id',
        'tipo_documento',
        'nombre_documento',
        'descripcion',
        'url_documento',
        'estado',
        'fecha_subida',
        'fecha_verificacion',
        'verificado_por',
        'observaciones',
    ];

    protected $casts = [
        'fecha_subida' => 'datetime',
        'fecha_verificacion' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function matricula()
    {
        return $this->belongsTo(Matricula::class);
    }

    public function verificador()
    {
        return $this->belongsTo(Usuario::class, 'verificado_por');
    }

    // Scopes
    public function scopeVerificados($query)
    {
        return $query->where('estado', 'VERIFICADO');
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_documento', $tipo);
    }
}
