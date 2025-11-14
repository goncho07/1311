<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;

class ReporteGenerado extends Model
{
    use SoftDeletes, BelongsToTenant, HasUuid;

    protected $connection = 'tenant'; // 🔴 CRÍTICO: Usa BD del tenant actual

    protected $table = 'reportes_generados';

    protected $fillable = [
        'uuid',
        'tipo_reporte',
        'nombre',
        'descripcion',
        'formato',
        'parametros',
        'fecha_generacion',
        'generado_por',
        'url_archivo',
        'tamano_bytes',
        'estado',
        'metadata',
    ];

    protected $casts = [
        'parametros' => 'array',
        'metadata' => 'array',
        'fecha_generacion' => 'datetime',
        'tamano_bytes' => 'integer',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function generador()
    {
        return $this->belongsTo(Usuario::class, 'generado_por');
    }

    // Scopes
    public function scopeByTipo($query, $tipo)
    {
        return $query->where('tipo_reporte', $tipo);
    }

    public function scopeByFormato($query, $formato)
    {
        return $query->where('formato', $formato);
    }

    public function scopeRecientes($query, $days = 7)
    {
        return $query->where('fecha_generacion', '>=', now()->subDays($days));
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
}
