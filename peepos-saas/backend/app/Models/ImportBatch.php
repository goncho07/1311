<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportBatch extends Model
{
    protected $table = 'import_batches';

    protected $fillable = [
        'uuid',
        'tenant_id',
        'usuario_id',
        'nombre_batch',
        'tipo_origen',
        'total_archivos',
        'archivos_procesados',
        'archivos_exitosos',
        'archivos_con_errores',
        'total_registros_encontrados',
        'total_registros_importados',
        'total_registros_con_errores',
        'estado',
        'configuracion',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'configuracion' => 'array',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->tenant_id) {
                $model->tenant_id = session('tenant_id');
            }
        });
    }

    public function files(): HasMany
    {
        return $this->hasMany(ImportFile::class, 'batch_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function getProgresoPorcentajeAttribute(): int
    {
        if ($this->total_archivos === 0) return 0;
        return (int) (($this->archivos_procesados / $this->total_archivos) * 100);
    }
}
