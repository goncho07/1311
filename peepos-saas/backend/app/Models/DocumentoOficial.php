<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class DocumentoOficial extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'documentos_oficiales';

    protected $fillable = [
        'uuid',
        'codigo_documento',
        'tipo_documento',
        'titulo',
        'descripcion',
        'entidad_tipo',
        'entidad_id',
        'url_documento',
        'formato',
        'tamano_bytes',
        'hash_archivo',
        'version',
        'estado',
        'fecha_emision',
        'fecha_vencimiento',
        'emitido_por',
        'firmado_digitalmente',
        'hash_firma',
        'observaciones',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'firmado_digitalmente' => 'boolean',
        'fecha_emision' => 'date',
        'fecha_vencimiento' => 'date',
        'tamano_bytes' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function entidad()
    {
        return $this->morphTo();
    }

    public function emisor()
    {
        return $this->belongsTo(Usuario::class, 'emitido_por');
    }

    // Scopes
    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_documento', $tipo);
    }

    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopeVigentes($query)
    {
        return $query->where('estado', 'VIGENTE')
                    ->where(function($q) {
                        $q->whereNull('fecha_vencimiento')
                          ->orWhere('fecha_vencimiento', '>=', now());
                    });
    }

    public function scopeFirmados($query)
    {
        return $query->where('firmado_digitalmente', true);
    }

    // Accessors
    public function getTamanoFormateadoAttribute(): string
    {
        $bytes = $this->tamano_bytes;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' bytes';
    }

    public function getEstaVigenteAttribute(): bool
    {
        return $this->estado === 'VIGENTE' &&
               (!$this->fecha_vencimiento || $this->fecha_vencimiento->isFuture());
    }
}
