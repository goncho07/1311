<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ═══════════════════════════════════════════════════════════
 * IMPORT FILE MODEL
 * ═══════════════════════════════════════════════════════════
 * 
 * Representa un archivo individual dentro de un batch de importación.
 * Cada archivo puede contener múltiples registros.
 */
class ImportFile extends Model
{
    use HasFactory;

    protected $table = 'import_files';

    protected $fillable = [
        'import_batch_id',
        'nombre_archivo',
        'ruta_archivo',
        'mime_type',
        'tamaño_kb',
        'modulo_detectado',
        'confianza_clasificacion',
        'total_registros',
        'registros_validos',
        'registros_invalidos',
        'estado',
        'errores',
        'tiempo_procesamiento_segundos',
        'fecha_procesamiento',
    ];

    protected $casts = [
        'errores' => 'array',
        'confianza_clasificacion' => 'float',
        'total_registros' => 'integer',
        'registros_validos' => 'integer',
        'registros_invalidos' => 'integer',
        'tamaño_kb' => 'integer',
        'tiempo_procesamiento_segundos' => 'integer',
        'fecha_procesamiento' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ════════════════════════════════════════════════════════
    // RELACIONES
    // ════════════════════════════════════════════════════════

    /**
     * Batch de importación al que pertenece este archivo
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(ImportBatch::class, 'import_batch_id');
    }

    /**
     * Registros extraídos de este archivo
     */
    public function records(): HasMany
    {
        return $this->hasMany(ImportRecord::class, 'import_file_id');
    }

    // ════════════════════════════════════════════════════════
    // ACCESSORS Y MUTATORS
    // ════════════════════════════════════════════════════════

    /**
     * Porcentaje de registros válidos
     */
    public function getPorcentajeValidosAttribute(): int
    {
        if ($this->total_registros === 0) {
            return 0;
        }
        
        return (int) (($this->registros_validos / $this->total_registros) * 100);
    }

    /**
     * Porcentaje de registros inválidos
     */
    public function getPorcentajeInvalidosAttribute(): int
    {
        if ($this->total_registros === 0) {
            return 0;
        }
        
        return (int) (($this->registros_invalidos / $this->total_registros) * 100);
    }

    /**
     * Extensión del archivo
     */
    public function getExtensionAttribute(): string
    {
        return pathinfo($this->nombre_archivo, PATHINFO_EXTENSION);
    }

    /**
     * Verificar si la clasificación es confiable (>= 80%)
     */
    public function getClasificacionConfiableAttribute(): bool
    {
        return $this->confianza_clasificacion >= 0.80;
    }

    // ════════════════════════════════════════════════════════
    // SCOPES
    // ════════════════════════════════════════════════════════

    /**
     * Filtrar por estado
     */
    public function scopeByEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Filtrar por módulo detectado
     */
    public function scopeByModulo($query, string $modulo)
    {
        return $query->where('modulo_detectado', $modulo);
    }

    /**
     * Solo archivos procesados exitosamente
     */
    public function scopeProcesados($query)
    {
        return $query->where('estado', 'PROCESADO');
    }

    /**
     * Solo archivos con errores
     */
    public function scopeConErrores($query)
    {
        return $query->where('estado', 'ERROR');
    }

    // ════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ════════════════════════════════════════════════════════

    /**
     * Marcar archivo como procesado
     */
    public function marcarComoProcesado(int $tiempoProcesamiento): void
    {
        $this->update([
            'estado' => 'PROCESADO',
            'fecha_procesamiento' => now(),
            'tiempo_procesamiento_segundos' => $tiempoProcesamiento,
        ]);
    }

    /**
     * Marcar archivo con error
     */
    public function marcarConError(array $errores): void
    {
        $this->update([
            'estado' => 'ERROR',
            'errores' => $errores,
            'fecha_procesamiento' => now(),
        ]);
    }

    /**
     * Actualizar contadores de registros
     */
    public function actualizarContadores(): void
    {
        $validos = $this->records()->where('estado_validacion', 'VALIDO')->count();
        $invalidos = $this->records()->where('estado_validacion', 'INVALIDO')->count();
        
        $this->update([
            'total_registros' => $validos + $invalidos,
            'registros_validos' => $validos,
            'registros_invalidos' => $invalidos,
        ]);
    }
}
